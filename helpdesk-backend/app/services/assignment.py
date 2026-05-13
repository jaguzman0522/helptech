from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.ticket import Ticket, TicketStatus

async def auto_assign_technician(db: AsyncSession, department_id: int, company_id: int) -> int:
    """
    Algorithm to auto-assign a technician:
    1. Find active technicians in the department.
    2. Prioritize the one with the fewest open tickets.
    3. Return the technician ID.
    """
    # Find active technicians in the specific department and company
    query = select(User).where(
        User.company_id == company_id,
        User.department_id == department_id,
        User.role == "technician",
        User.is_active == True
    )
    result = await db.execute(query)
    technicians = result.scalars().all()
    
    if not technicians:
        # Fallback: Find any active technician in the company
        query = select(User).where(
            User.company_id == company_id,
            User.role == "technician",
            User.is_active == True
        )
        result = await db.execute(query)
        technicians = result.scalars().all()
        
    if not technicians:
        return None

    # Count open/in-progress tickets per technician
    min_load = float('inf')
    best_tech_id = technicians[0].id
    
    for tech in technicians:
        count_query = select(func.count(Ticket.id)).where(
            Ticket.technician_id == tech.id,
            Ticket.status.in_([TicketStatus.OPEN, TicketStatus.ON_WAY, TicketStatus.IN_PROGRESS])
        )
        count_res = await db.execute(count_query)
        load = count_res.scalar()
        
        if load < min_load:
            min_load = load
            best_tech_id = tech.id
            
    return best_tech_id
