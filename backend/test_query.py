import asyncio
import traceback
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from app.services.dashboard_service import dashboard_service

async def run_test():
    # Setup database engine
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with Session() as db:
        try:
            print("Calling get_dashboard with user_id = 1...")
            # We assume user_id 1 is the one we created in demo-login
            res = await dashboard_service.get_dashboard(db, 1)
            print("Dashboard compiled successfully!")
            print(res)
        except Exception as e:
            print("Failed with exception:")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_test())
