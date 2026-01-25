from google.adk.agents import Agent as BaseAgent

class TraitQuestAgent(BaseAgent):
    """
    Wrapper around Google ADK Agent to avoid 'app name mismatch' warnings
    caused by inferring the app name from the directory structure.
    
    The ADK Runner infers the agent's origin app name based on the directory
    where the agent class is defined. If defined in 'google.adk.agents' (which BaseAgent is),
    it infers 'agents'. By subclassing it here (in 'app.core'), the link to 'agents' directory
    is broken, and the Runner will skip the app name validation check, avoiding the warning.
    """
    pass
