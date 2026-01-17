import os
import smtplib
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader

# Configuration
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USER)
SENDER_NAME = "TraitQuest Guide Abby"

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "../templates")
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

# Pre-load avatar image as base64 for email embedding
AVATAR_BASE64 = ""
try:
    avatar_path = os.path.join(
        os.path.dirname(__file__),
        "../../../frontend/public/assets/images/quest_bg.webp",
    )
    with open(avatar_path, "rb") as img_file:
        AVATAR_BASE64 = base64.b64encode(img_file.read()).decode("utf-8")
except Exception as e:
    print(f"Warning: Could not load avatar image for email: {e}")


def send_welcome_email(
    to_email: str, username: str, frontend_url: str = "http://localhost:3000"
):
    """
    Sends a welcome email to the new user.
    """
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        print("SMTP not configured. Skipping welcome email.")
        return

    try:
        # Load Template
        template = env.get_template("welcome_email.html")

        # Prepare avatar data URI
        avatar_src = f"data:image/webp;base64,{AVATAR_BASE64}" if AVATAR_BASE64 else ""

        html_content = template.render(
            username=username, action_url=frontend_url, avatar_src=avatar_src
        )

        # Create Message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "【TraitQuest】歡迎來到心靈大陸 - 給勇者的一封信"
        msg["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        msg["To"] = to_email

        # Attach HTML content
        part1 = MIMEText(html_content, "html")
        msg.attach(part1)

        # Send Email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())

        print(f"Welcome email sent to {to_email}")

    except Exception as e:
        print(f"Failed to send welcome email to {to_email}: {e}")
