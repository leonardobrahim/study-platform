import os
import sys
from datetime import datetime, timedelta, timezone

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.semester import Semester
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.task import Task
from app.models.study_session import StudySession

def seed():
    db = SessionLocal()
    
    # 1. Check or create User
    email = "portfolio@teste.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name="Conta de Portfólio",
            email=email,
            password_hash=get_password_hash("portfolio123")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User created: {user.email}")
    else:
        print(f"User already exists: {user.email}")
        
    # 2. Check or create Semester
    semester = db.query(Semester).filter(Semester.user_id == user.id, Semester.name == "Semestre Atual").first()
    if not semester:
        semester = Semester(
            user_id=user.id,
            name="Semestre Atual",
            year=2026,
            period=2,
            status="ACTIVE"
        )
        db.add(semester)
        db.commit()
        db.refresh(semester)
        print("Semester created.")
        
    # 3. Create Subjects
    subjects_data = [
        {"name": "Cálculo III", "code": "MAT003", "professor": "Prof. Silva", "color": "#FF5733", "description": "Integrais múltiplas e cálculo vetorial."},
        {"name": "Física Moderna", "code": "FIS004", "professor": "Prof. Costa", "color": "#3366FF", "description": "Relatividade e mecânica quântica."},
        {"name": "Estrutura de Dados", "code": "COMP001", "professor": "Prof. Santos", "color": "#33FF57", "description": "Árvores, grafos e algoritmos de busca."}
    ]
    
    created_subjects = []
    for s in subjects_data:
        subject = db.query(Subject).filter(Subject.semester_id == semester.id, Subject.name == s["name"]).first()
        if not subject:
            subject = Subject(
                semester_id=semester.id,
                name=s["name"],
                code=s["code"],
                professor=s["professor"],
                color=s["color"],
                description=s["description"]
            )
            db.add(subject)
            db.commit()
            db.refresh(subject)
        created_subjects.append(subject)
    print(f"Created/Found {len(created_subjects)} subjects.")

    # 4. Create Topics
    topics_data = {
        "Cálculo III": [
            {"name": "Integrais Duplas", "difficulty": "MEDIUM", "status": "COMPLETED"},
            {"name": "Integrais Triplas", "difficulty": "HARD", "status": "IN_PROGRESS"},
            {"name": "Teorema de Green", "difficulty": "HARD", "status": "NOT_STARTED"}
        ],
        "Física Moderna": [
            {"name": "Relatividade Restrita", "difficulty": "HARD", "status": "COMPLETED"},
            {"name": "Efeito Fotoelétrico", "difficulty": "MEDIUM", "status": "IN_PROGRESS"}
        ],
        "Estrutura de Dados": [
            {"name": "Árvores Binárias", "difficulty": "MEDIUM", "status": "COMPLETED"},
            {"name": "Árvores AVL", "difficulty": "HARD", "status": "NOT_STARTED"}
        ]
    }
    
    created_topics = []
    for subject in created_subjects:
        if subject.name in topics_data:
            for t in topics_data[subject.name]:
                topic = db.query(Topic).filter(Topic.subject_id == subject.id, Topic.name == t["name"]).first()
                if not topic:
                    topic = Topic(
                        subject_id=subject.id,
                        name=t["name"],
                        difficulty=t["difficulty"],
                        status=t["status"]
                    )
                    db.add(topic)
                    db.commit()
                    db.refresh(topic)
                created_topics.append(topic)
    print(f"Created/Found {len(created_topics)} topics.")

    # 5. Create Tasks
    tasks_data = [
        {"title": "Lista de Integrais", "status": "COMPLETED", "priority": "HIGH", "subject_idx": 0},
        {"title": "Trabalho de Relatividade", "status": "PENDING", "priority": "HIGH", "subject_idx": 1},
        {"title": "Implementar Árvore Binária", "status": "PENDING", "priority": "MEDIUM", "subject_idx": 2}
    ]
    
    for t_data in tasks_data:
        subject = created_subjects[t_data["subject_idx"]]
        task = db.query(Task).filter(Task.user_id == user.id, Task.title == t_data["title"]).first()
        if not task:
            task = Task(
                user_id=user.id,
                subject_id=subject.id,
                title=t_data["title"],
                status=t_data["status"],
                priority=t_data["priority"],
                due_date=datetime.now(timezone.utc) + timedelta(days=7)
            )
            db.add(task)
            db.commit()
            
    # 6. Create Study Sessions
    for subject in created_subjects:
        session = db.query(StudySession).filter(StudySession.user_id == user.id, StudySession.subject_id == subject.id).first()
        if not session:
            start = datetime.now(timezone.utc) - timedelta(days=1, hours=2)
            end = start + timedelta(hours=2)
            session = StudySession(
                user_id=user.id,
                subject_id=subject.id,
                start_time=start,
                end_time=end,
                duration=7200,
                notes=f"Estudo inicial de {subject.name}"
            )
            db.add(session)
            db.commit()

    print("Seed process completed successfully!")
    print("Email: portfolio@teste.com")
    print("Password: portfolio123")
    
if __name__ == "__main__":
    seed()
