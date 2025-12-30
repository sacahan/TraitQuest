import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run_migrations():
    # Convert sqlalchemy URL to asyncpg URL if needed
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    
    print(f"Connecting to {db_url}...")
    conn = await asyncpg.connect(db_url)
    
    try:
        # Get list of sql files
        migrations_dir = "/Users/sacahan/Documents/workspace/TraitQuest/backend/migrations"
        sql_files = sorted([f for f in os.listdir(migrations_dir) if f.endswith(".sql")])
        
        for sql_file in sql_files:
            print(f"Applying {sql_file}...")
            file_path = os.path.join(migrations_dir, sql_file)
            with open(file_path, "r", encoding="utf-8") as f:
                sql = f.read()
                # asyncpg execute can handle multiple statements if they are separated by ;
                await conn.execute(sql)
            print(f"Successfully applied {sql_file}")
            
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migrations())
