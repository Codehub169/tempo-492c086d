import os
import re
import logging
from docx import Document
from PyPDF2 import PdfReader

# Configure basic logging if this module is run directly (for testing)
# When imported by app.py, Flask's logging config will likely take precedence.
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Basic regex patterns for contact information (using raw strings for clarity)
EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
PHONE_REGEX = r"(?:\+?\d{1,3}[-\s()]?)?(?:\d{2,4}[-\s()]?){2,5}\d{2,4}"
LINKEDIN_REGEX = r"linkedin\.com/in/\S+"
GITHUB_REGEX = r"github\.com/\S+"

# Keywords for section identification (expanded for better matching)
SECTION_KEYWORDS = {
    'summary': ['summary', 'objective', 'about me', 'professional profile', 'personal statement', 'overview'],
    'experience': ['experience', 'work history', 'employment history', 'professional experience', 'career summary', 'projects', 'relevant experience'],
    'education': ['education', 'academic background', 'qualifications', 'academic history', 'scholastic record'],
    'skills': ['skills', 'technical skills', 'proficiencies', 'core competencies', 'technical expertise', 'technologies', 'tools']
}

def _extract_text_from_pdf(file_path):
    """Extracts text content from a PDF file."""
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        logging.error(f"Error reading PDF {file_path}: {e}", exc_info=True)
    return text

def _extract_text_from_docx(file_path):
    """Extracts text content from a DOCX file."""
    text = ""
    try:
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        logging.error(f"Error reading DOCX {file_path}: {e}", exc_info=True)
    return text

def _process_section_content(section_name, content_lines, target_dict):
    """Helper function to process accumulated content for a section."""
    if not section_name or not content_lines or section_name not in target_dict:
        return

    full_content_block = '\n'.join(content_lines)

    if section_name in ['experience', 'education']:
        target_dict[section_name].append(full_content_block)
    elif section_name == 'skills':
        for item_line in content_lines:
            skills_found = [s.strip() for s in item_line.split(',') if s.strip()]
            target_dict[section_name].extend(skills_found)
    else: # For 'summary' or other single-block text sections
        if target_dict[section_name]: # Append if content already exists
            target_dict[section_name] += "\n" + full_content_block
        else:
            target_dict[section_name] = full_content_block

def _parse_sections(text_content):
    """Rudimentary parsing of text into predefined sections based on keywords."""
    parsed_data = {
        'name': 'Your Name', 
        'title': 'Professional Title',
        'email': '',
        'phone': '',
        'linkedin': '',
        'github': '',
        'summary': '',
        'experience': [],
        'education': [],
        'skills': []
    }

    # Extract contact info (take first unique one for links, comma-join for email/phone)
    parsed_data['email'] = ', '.join(sorted(list(set(re.findall(EMAIL_REGEX, text_content, re.IGNORECASE)))))
    parsed_data['phone'] = ', '.join(sorted(list(set(re.findall(PHONE_REGEX, text_content)))))
    
    linkedin_urls = sorted(list(set(re.findall(LINKEDIN_REGEX, text_content, re.IGNORECASE))))
    if linkedin_urls:
        parsed_data['linkedin'] = linkedin_urls[0]

    github_urls = sorted(list(set(re.findall(GITHUB_REGEX, text_content, re.IGNORECASE))))
    if github_urls:
        parsed_data['github'] = github_urls[0]

    lines = [line.strip() for line in text_content.split('\n') if line.strip()]
    current_section = None
    temp_content = []

    # Attempt to get name and title from early lines (very naive)
    # These lines will be skipped in the main parsing loop if successfully identified.
    parsed_name_line = -1
    parsed_title_line = -1

    if len(lines) > 0:
        parsed_data['name'] = lines[0]
        parsed_name_line = 0
        if len(lines) > 1 and len(lines[1].split()) < 7 and not re.search(EMAIL_REGEX + "|" + PHONE_REGEX, lines[1], re.IGNORECASE):
            parsed_data['title'] = lines[1]
            parsed_title_line = 1

    for i, line in enumerate(lines):
        if i == parsed_name_line or i == parsed_title_line:
            continue # Skip lines already used for name/title

        line_lower = line.lower()
        identified_new_section = False

        for section_key_candidate, keywords in SECTION_KEYWORDS.items():
            for keyword in keywords:
                if keyword in line_lower and len(line.split()) < 5 and len(line) < 60: 
                    _process_section_content(current_section, temp_content, parsed_data)
                    current_section = section_key_candidate
                    temp_content = [] # Header line is not part of content
                    identified_new_section = True
                    break 
            if identified_new_section:
                break 
        
        if not identified_new_section:
            if current_section:
                temp_content.append(line)
            elif not parsed_data['summary'] and len(line.split()) > 3: # Content before any section
                parsed_data['summary'] += line + "\n"

    _process_section_content(current_section, temp_content, parsed_data)
    
    if parsed_data['skills']:
        unique_skills = list(set(s.strip().capitalize() for s in parsed_data['skills'] if s.strip()))
        parsed_data['skills'] = sorted([skill for skill in unique_skills if 1 < len(skill) < 50])
    else:
        parsed_data['skills'] = []

    if parsed_data['summary']:
        parsed_data['summary'] = parsed_data['summary'].strip()

    return parsed_data

def parse_resume(file_path):
    """Parses a resume file (PDF, DOCX, DOC) and extracts information."""
    _, file_extension = os.path.splitext(file_path)
    text_content = ""

    ext_lower = file_extension.lower()
    if ext_lower == '.pdf':
        text_content = _extract_text_from_pdf(file_path)
    elif ext_lower in ['.docx', '.doc']:
        # Note: python-docx has primary support for .docx. 
        # Basic .doc support might work but is not guaranteed.
        text_content = _extract_text_from_docx(file_path)
    else:
        allowed_types = "PDF, DOCX, DOC"
        raise ValueError(f"Unsupported file type: {ext_lower}. Only {allowed_types} are supported.")

    if not text_content.strip():
        return {
            'name': 'Error: Could Not Parse Name',
            'title': 'Error: Could Not Parse Title',
            'email': '', 'phone': '', 'linkedin': '', 'github': '',
            'summary': 'Could not extract text from the resume. The document might be image-based, corrupted, or empty.',
            'experience': [],
            'education': [],
            'skills': []
        }

    parsed_data = _parse_sections(text_content)
    return parsed_data

if __name__ == '__main__':
    # Example Usage (Create dummy files for testing or provide paths)
    dummy_docx_path = 'dummy_resume.docx' 
    dummy_pdf_path = 'dummy_resume.pdf' # Needs to be created manually

    # Create a dummy docx for testing
    try:
        from docx import Document as DocxCreate # Renamed for clarity
        doc = DocxCreate()
        doc.add_heading('Dr. Jane Doe', 0)
        doc.add_paragraph('Senior Quantum Physicist & Bagel Enthusiast')
        doc.add_paragraph('jane.doe@example.com | 555-123-4567 | linkedin.com/in/janedoe | github.com/janedoe')
        doc.add_heading('Overview', level=1)
        doc.add_paragraph('A highly motivated and experienced physicist with a strong background in quantum mechanics and a passion for bagels. Proven ability to solve complex problems and lead research initiatives. Seeking a challenging role that combines scientific inquiry with breakfast food exploration.')
        doc.add_heading('Professional Experience', level=1)
        doc.add_paragraph('Lead Physicist, Quantum Bagel Labs (2018-Present)\n- Spearheaded research on the quantum properties of toasted bagels.\n- Managed a team of 3 junior physicists and 2 bakers.\n- Published 5 papers in prestigious bagel-physics journals.')
        doc.add_paragraph('Research Fellow, Institute of Theoretical Breakfast (2015-2018)\n- Conducted experiments on Schrödinger\'s cat and its breakfast preferences.\n- Developed new models for predicting coffee spill patterns.')
        doc.add_heading('Education', level=1)
        doc.add_paragraph('Ph.D. in Quantum Bagel Dynamics, University of Advanced Studies (2015)')
        doc.add_paragraph('B.S. in Physics, State College (2011)')
        doc.add_heading('Technical Skills', level=1)
        doc.add_paragraph('Quantum Entanglement, Python, LaTeX, Matlab, Data Analysis, Bagel Slicing, Cream Cheese Spreading, Public Speaking')
        doc.add_paragraph('Leadership, Problem Solving, Critical Thinking')
        doc.save(dummy_docx_path)
        logging.info(f"Dummy DOCX created at {dummy_docx_path}")
        
        parsed_docx_data = parse_resume(dummy_docx_path)
        logging.info("\n--- Parsed DOCX Data ---")
        for key, value in parsed_docx_data.items():
            logging.info(f"{key.capitalize()}: {value}")
    except ImportError:
        logging.warning("python-docx library not found. Cannot create or parse dummy DOCX.")
    except Exception as e:
        logging.error(f"Error in DOCX example processing: {e}", exc_info=True)

    # Test with a PDF (ensure dummy_resume.pdf exists or provide a valid path)
    if os.path.exists(dummy_pdf_path):
        logging.info(f"\n--- Parsing PDF: {dummy_pdf_path} ---")
        try:
            parsed_pdf_data = parse_resume(dummy_pdf_path)
            logging.info("\n--- Parsed PDF Data ---")
            for key, value in parsed_pdf_data.items():
                logging.info(f"{key.capitalize()}: {value}")
        except Exception as e:
            logging.error(f"Error parsing PDF {dummy_pdf_path}: {e}", exc_info=True)
    else:
        logging.warning(f"Dummy PDF {dummy_pdf_path} not found. Create it manually for testing PDF parsing.")
    pass
