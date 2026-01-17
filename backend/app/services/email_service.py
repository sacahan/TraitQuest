import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
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

# Default Abby Avatar URL (from AboutPage.tsx)
DEFAULT_AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDdgsdPqi5uGvwrf5iPWXEJC9qS8i9aTLpjHw3SiAV2TTttciCM3iZNUdRRPurYc2p92sLZgoPOMhkZDbN1mC4faxb2KKyofRy9P5uCJY-C22N-vAsHP76EH_60g3b-zk0wnyr38wNP8fpHLbX_XIHXmdO9At5o9JytdxUKLu2Fgt0gLU4JGL_uWVMbJhkaE-rh2QlFPisJ99D43_dTbqiCXh7lTlnLmHWsZ3HYuY_bNKyU_7vs6rTdJhmV91GcvmDPMYWmBFcHNN1k"


def send_welcome_email(
    to_email: str,
    username: str,
    frontend_url: str = "http://localhost:3000",
    avatar_url: str = None,
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

        # Prepare avatar source
        # Use local quest_bg.webp via CID
        avatar_src = "cid:avatar_image"

        html_content = template.render(
            username=username, action_url=frontend_url, avatar_src=avatar_src
        )

        # Create Message
        # Use "related" for mixed content like inline images
        msg = MIMEMultipart("related")
        msg["Subject"] = "【TraitQuest】歡迎來到心靈大陸 - 給勇者的一封信"
        msg["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        msg["To"] = to_email

        # Create alternative part for HTML
        msg_alternative = MIMEMultipart("alternative")
        msg.attach(msg_alternative)

        # Attach HTML content
        part_html = MIMEText(html_content, "html")
        msg_alternative.attach(part_html)

        # Attach Local Avatar Image (quest_bg.webp) as CID
        avatar_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "../../../frontend/public/assets/images/quest_bg.webp",
            )
        )

        if os.path.exists(avatar_path):
            try:
                with open(avatar_path, "rb") as f:
                    img_data = f.read()
                    img_part = MIMEBase("image", "webp")
                    img_part.set_payload(img_data)
                    encoders.encode_base64(img_part)
                    img_part.add_header("Content-ID", "<avatar_image>")
                    img_part.add_header(
                        "Content-Disposition", "inline", filename="quest_bg.webp"
                    )
                    msg.attach(img_part)
            except Exception as e:
                print(f"Warning: Could not attach local image: {e}")

        # Send Email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())

        print(f"Welcome email sent to {to_email}")

    except Exception as e:
        print(f"Failed to send welcome email to {to_email}: {e}")
