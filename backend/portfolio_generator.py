import jinja2
import os

# Setup Jinja2 environment
# Assuming templates are in a 'templates' directory relative to this file's location
# For this project, it's backend/templates/
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates')
loader = jinja2.FileSystemLoader(TEMPLATE_DIR)
env = jinja2.Environment(loader=loader, autoescape=jinja2.select_autoescape(['html', 'xml']))

def generate_portfolio_html(parsed_data, template_name='portfolio_base.html'):
    """
    Generates HTML content for a portfolio website using parsed resume data and a Jinja2 template.

    Args:
        parsed_data (dict): A dictionary containing structured data extracted from the resume.
                              Expected keys include: name, title, email, phone, linkedin, github,
                              summary, experience (list), education (list), skills (list).
        template_name (str): The filename of the Jinja2 template to use (e.g., 'portfolio_base.html').

    Returns:
        str: The rendered HTML content as a string.
    """
    try:
        template = env.get_template(template_name)
        # Pass data under a 'data' key for clarity in template
        # Also pass datetime for potential use in template, e.g. copyright year
        from datetime import datetime
        html_content = template.render(data=parsed_data, now=datetime.utcnow())
        return html_content
    except jinja2.TemplateNotFound:
        return f"Error: Template '{template_name}' not found in {TEMPLATE_DIR}."
    except Exception as e:
        return f"Error during HTML generation: {str(e)}"

if __name__ == '__main__':
    # Example Usage:
    mock_parsed_data = {
        'name': 'Alice Wonderland',
        'title': 'Creative Explorer & Problem Solver',
        'email': 'alice.wonder@example.com',
        'phone': '123-456-7890',
        'linkedin': 'linkedin.com/in/alicewonder',
        'github': 'github.com/alicew',
        'summary': 'A curious and imaginative individual with a knack for solving riddles and navigating peculiar situations. Eager to apply creative thinking to new challenges in a dynamic environment. Experienced in tea party management and croquet with flamingos.',
        'experience': [
            {
                'title': 'Chief Tea Party Organizer',
                'company': 'Mad Hatter Inc.',
                'period': 'Ongoing',
                'description': 'Organized and hosted daily tea parties, managed diverse guest lists, and ensured adherence to nonsensical rules. Successfully increased party attendance by 200%.'
            },
            "Royal Croquet Player\nQueen of Hearts Court\nSeasonal\nParticipated in high-stakes croquet matches using live flamingos and hedgehogs. Developed strategies for unpredictable game equipment."
        ],
        'education': [
            {
                'degree': 'Advanced Studies in Nonsense',
                'institution': 'Wonderland Academy',
                'period': 'Graduated Cum Laude',
                'details': 'Focused on illogical reasoning and dream interpretation.'
            },
            "Basic Potion Brewing\nCheshire Cat Institute\nShort Course\nLearned to brew potions that shrink and enlarge."
        ],
        'skills': ['Riddle Solving', 'Adaptability', 'Creative Thinking', 'Croquet', 'Tea Brewing', 'Storytelling']
    }

    print(f"Looking for templates in: {TEMPLATE_DIR}")
    print(f"Template file expected: {os.path.join(TEMPLATE_DIR, 'portfolio_base.html')}")

    # Create a dummy template if it doesn't exist for testing
    dummy_template_path = os.path.join(TEMPLATE_DIR, 'portfolio_base.html')
    if not os.path.exists(dummy_template_path):
        if not os.path.exists(TEMPLATE_DIR):
            os.makedirs(TEMPLATE_DIR)
        with open(dummy_template_path, 'w') as f:
            # A very simple template for testing purposes
            f.write("<h1>{{ data.name }}</h1><p>{{ data.title }}</p><h2>Summary</h2><p>{{ data.summary | replace('\\n', '<br>') | safe }}</p><h2>Skills</h2><ul>{% for skill in data.skills %}<li>{{ skill }}</li>{% endfor %}</ul><h2>Experience</h2>{% for job in data.experience %}<div class='exp'>{% if job is mapping %}<h3>{{ job.title }}</h3><p>{{job.description}}</p>{% else %}<p>{{ job | replace('\\n', '<br>') | safe }}</p>{% endif %}</div>{% endfor %}<footer>&copy; {{ now.year }} {{ data.name }}</footer>")
        print(f"Created dummy template at {dummy_template_path}")

    html_output = generate_portfolio_html(mock_parsed_data)

    if html_output.startswith("Error:"):
        print(html_output)
    else:
        print("\n--- Generated HTML (Snippet) ---")
        print(html_output[:1000] + "...")
        # Optionally, save to a file
        # with open('generated_portfolio_example.html', 'w', encoding='utf-8') as f:
        #     f.write(html_output)
        # print("\nFull HTML saved to generated_portfolio_example.html")
