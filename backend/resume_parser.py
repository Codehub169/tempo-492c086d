import os
import re
from docx import Document
from PyPDF2 import PdfReader

# Basic regex patterns for contact information
EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
PHONE_REGEX = r"(?:\+?\d{1,3}[-\s\(\)]?)?(?:\d{2,4}[-\s\(\)]?){2,5}\d{2,4}" # More generic phone regex
LINKEDIN_REGEX = r"linkedin\.com/in/\S+"
GITHUB_REGEX = r"github\.com/\S+"

# Keywords for section identification (very basic)
SECTION_KEYWORDS = {
    'summary': ['summary', 'objective', 'about me', 'professional profile'],
    'experience': ['experience', 'work history', 'employment history', 'professional experience'],
    'education': ['education', 'academic background', 'qualifications'],
    'skills': ['skills', 'technical skills', 'proficiencies', 'core competencies']
}

def _extract_text_from_pdf(file_path):
    """Extracts text content from a PDF file."""
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
    return text

def _extract_text_from_docx(file_path):
    """Extracts text content from a DOCX file."""
    text = ""
    try:
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX {file_path}: {e}")
    return text

def _parse_sections(text_content):
    """Rudimentary parsing of text into predefined sections based on keywords."""
    # This is a highly simplified parser and will need significant improvement
    # for real-world resumes. It assumes sections are clearly demarcated.
    parsed_data = {
        'name': 'Your Name', # Placeholder, name extraction is complex
        'title': 'Professional Title', # Placeholder
        'email': '',
        'phone': '',
        'linkedin': '',
        'github': '',
        'summary': '',
        'experience': [], # List of strings or dicts
        'education': [],  # List of strings or dicts
        'skills': []      # List of strings
    }

    # Extract contact info
    parsed_data['email'] = ', '.join(re.findall(EMAIL_REGEX, text_content, re.IGNORECASE))
    parsed_data['phone'] = ', '.join(re.findall(PHONE_REGEX, text_content))
    parsed_data['linkedin'] = ', '.join(re.findall(LINKEDIN_REGEX, text_content, re.IGNORECASE))
    parsed_data['github'] = ', '.join(re.findall(GITHUB_REGEX, text_content, re.IGNORECASE))

    # Basic section extraction (highly heuristic)
    lines = [line.strip() for line in text_content.split('\n') if line.strip()]
    current_section = None
    temp_content = []

    # Attempt to get name and title from early lines (very naive)
    if len(lines) > 0: parsed_data['name'] = lines[0]
    if len(lines) > 1 and len(lines[1].split()) < 5: parsed_data['title'] = lines[1] # Guess title if short

    for line in lines:
        line_lower = line.lower()
        found_section = False
        for section_key, keywords in SECTION_KEYWORDS.items():
            for keyword in keywords:
                if keyword in line_lower and len(line.split()) < 5: # Assume section headers are short
                    if current_section and temp_content:
                        if section_key in ['experience', 'education']:
                             parsed_data[current_section].append('\n'.join(temp_content))
                        elif section_key == 'skills':
                            # Split skills by comma, then extend the list
                            skills_from_content = []
                            for item in temp_content:
                                skills_from_content.extend([s.strip() for s in item.split(',') if s.strip()])
                            parsed_data[current_section].extend(skills_from_content)
                        else: # summary
                            parsed_data[current_section] = '\n'.join(temp_content)
                    current_section = section_key
                    temp_content = []
                    found_section = True
                    break
            if found_section: break
        
        if not found_section and current_section:
            temp_content.append(line)

    # Add content of the last section
    if current_section and temp_content:
        if current_section in ['experience', 'education']:
                parsed_data[current_section].append('\n'.join(temp_content))
        elif current_section == 'skills':
            skills_from_content = []
            for item in temp_content:
                skills_from_content.extend([s.strip() for s in item.split(',') if s.strip()])
            parsed_data[current_section].extend(skills_from_content)
        else: # summary
            parsed_data[current_section] = '\n'.join(temp_content)
    
    # Clean up skills list (remove duplicates and very short/long items)
    if parsed_data['skills']:
        parsed_data['skills'] = sorted(list(set(skill for skill in parsed_data['skills'] if len(skill) > 1 and len(skill) < 50)))

    return parsed_data

def parse_resume(file_path):
    """Parses a resume file (PDF or DOCX) and extracts information."""
    _, file_extension = os.path.splitext(file_path)
    text_content = ""

    if file_extension.lower() == '.pdf':
        text_content = _extract_text_from_pdf(file_path)
    elif file_extension.lower() == '.docx':
        text_content = _extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file type. Only PDF and DOCX are supported.")

    if not text_content.strip():
        # Fallback if text extraction yields nothing or only whitespace
        return {
            'name': 'Error: Could Not Parse Name',
            'title': 'Error: Could Not Parse Title',
            'email': '', 'phone': '', 'linkedin': '', 'github': '',
            'summary': 'Could not extract text from the resume. The document might be image-based or corrupted.',
            'experience': [],
            'education': [],
            'skills': []
        }

    parsed_data = _parse_sections(text_content)
    return parsed_data

if __name__ == '__main__':
    # Example Usage (Create dummy files for testing)
    # Create a dummy docx
    # from docx import Document as DocxCreate
    # doc = DocxCreate()
    # doc.add_heading('John Doe', 0)
    # doc.add_paragraph('Software Engineer')
    # doc.add_paragraph('Email: john.doe@example.com Phone: 123-456-7890')
    # doc.add_heading('Summary', level=1)
    # doc.add_paragraph('A passionate software engineer...') 
    # doc.add_heading('Experience', level=1)
    # doc.add_paragraph('Software Developer at Tech Corp (2020-Present)\nAnother line for experience.')
    # doc.add_heading('Education', level=1)
    # doc.add_paragraph('B.S. Computer Science from University of Example (2020)')
    # doc.add_heading('Skills', level=1)
    # doc.add_paragraph('Python, Java, JavaScript, React')
    # doc.save('dummy_resume.docx')
    # print("Dummy DOCX created.")
    # parsed_docx = parse_resume('dummy_resume.docx')
    # print("\n--- Parsed DOCX ---")
    # for key, value in parsed_docx.items():
    #     print(f"{key.capitalize()}: {value}")

    # Create a dummy PDF (difficult to do programmatically without external libs like reportlab)
    # print("\nPlease create a dummy_resume.pdf manually for testing PDF parsing.")
    # if os.path.exists('dummy_resume.pdf'):
    #     parsed_pdf = parse_resume('dummy_resume.pdf')
    #     print("\n--- Parsed PDF ---")
    #     for key, value in parsed_pdf.items():
    #         print(f"{key.capitalize()}: {value}")
    pass
