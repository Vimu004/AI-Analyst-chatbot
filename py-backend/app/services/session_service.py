import uuid

class SessionManager:
    def __init__(self):
        self.sessions = {}

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {}
        return session_id

    def get_session_data(self, session_id: str, key: str):
        return self.sessions.get(session_id, {}).get(key)

    def update_session_data(self, session_id: str, key: str, value):
        if session_id in self.sessions:
            self.sessions[session_id][key] = value

session_manager = SessionManager()