import sys
import json
import fitz
import joblib
import os
from ResumeParser import ResumeParserModel, JobMatchScoreModel
def run_resume_match(resume_path, job_description, experience_data, education_data):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, "parser_model.joblib")

    model = joblib.load(model_path)

    parser = model
    with fitz.open(resume_path) as doc:
        text = "".join([page.get_text() for page in doc])
    resume_result = parser.parse(text)
    job_match = JobMatchScoreModel(job_description, experience_data, education_data, resume_result)
    result = {
        "resume_result": resume_result,
        "job_match_score": {
            "skills": job_match.skill(),
            "experience": job_match.experience(),
            "education": job_match.education(),
            "total": job_match.total_score()
        }
    }
    return result
if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Arguments Missing"}))
        sys.exit(1)
    resume_path = sys.argv[1]
    job_description = sys.argv[2]
    experience_data = sys.argv[3]
    education_data = sys.argv[4]

    result = run_resume_match(resume_path, job_description, experience_data, education_data)
    print(json.dumps(result))

