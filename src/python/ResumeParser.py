import re
import fitz
import sys
import json
from collections import defaultdict

class ResumeParserModel:
    def __init__(self, vectorizer, clf):
        self.vectorizer = vectorizer
        self.clf = clf
        self.skills_list = [
            'Python','Java','JavaScript','C++','SQL','Django','Flask','React','Node.js',
            'Machine Learning','Deep Learning','HTML','CSS','Bootstrap','Power BI','Tableau',
            'TensorFlow','Keras','PyTorch','Excel','Word','PowerPoint','Communication',
            'Teamwork','Leadership','Problem Solving','Time Management','Adaptability','Critical Thinking'
        ]
        self.headers = {
            "projects": ["projects", "project"],
            "education": ["education"],
            "experience": ["experience", "work experience"],
            "certifications": ["certifications"]
        }

    def pdf_text(self, file):
        return "".join([p.get_text() for p in fitz.open(file)])

    def extract_info(self, text):
        email = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', text)
        phone = re.findall(r'\b\d{11,13}\b', text)
        found_skills = [s for s in self.skills_list if s.lower() in text.lower()]
        return email[0] if email else None, phone[0] if phone else None, found_skills

    def extract_name(self, lines): 
        for n in lines[:10]:
            words = n.strip().split()
            if n.isupper() and ' ' in n:
                if len(words) >= 2 and all(w[0].isalpha() for w in words):
                    return n.title()
        return None

    def segment(self, lines):
        out = {k: [] for k in self.headers}
        used = set()
        for i, l in enumerate(lines):
            for sec, keys in self.headers.items():
                if any(l.lower().startswith(k) for k in keys):
                    end = next((j for j in range(i+1,len(lines))
                               if any(lines[j].lower().startswith(x)
                               for x in sum(self.headers.values(), []))),
                               len(lines))
                    out[sec] = lines[i+1:end]
                    used.update(range(i+1,end))
        return out, used

    def ml_classify(self, lines, used):
        out = defaultdict(list)
        if not self.vectorizer or not self.clf:
            return out  # agar ML model pass nahi hua
        for i, l in enumerate(lines):
            if i not in used and len(l.split()) > 3:
                label = self.clf.predict(self.vectorizer.transform([l]))[0]
                out[label].append(l)
        return out

    def parse(self, text):
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        name = self.extract_name(lines)
        email, phone, skills = self.extract_info(text)
        anchored, used = self.segment(lines)
        ml = self.ml_classify(lines, used)
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "education": anchored.get("education", []) + ml.get("education", []),
            "experience": anchored.get("experience", []) + ml.get("experience", []),
            "projects": anchored.get("projects", []) + ml.get("projects", []),
            "certifications": anchored.get("certifications", []) + ml.get("certifications", [])
        }


class JobMatchScoreModel:
    skills = [
        'Python','Java','JavaScript','C++','SQL','Django','Flask','React','Node.js',
        'Machine Learning','Deep Learning','HTML','CSS','Bootstrap','Power BI','Tableau',
        'TensorFlow','Keras','PyTorch','Excel','Word','PowerPoint','Communication','Teamwork',
        'Leadership','Problem Solving','Time Management','Adaptability','Critical Thinking'
    ]
    def __init__(self, job_description, experience_data, education_data, resume_result):
        self.job_description = job_description.lower()
        self.experience_data = experience_data.lower()
        self.education_data = education_data.lower()
        self.resume_result = resume_result

    def skill(self):
        job_skills = [s.lower() for s in self.skills if s.lower() in self.job_description]
        resume_skills = [s.lower() for s in self.resume_result.get("skills", [])]
        matched = set(job_skills) & set(resume_skills)
        if not job_skills:  
            return 0
        return (len(matched) / len(job_skills)) * 100

    def experience(self):
        job_years_match = re.search(r'(\d+)\s+years?', self.experience_data)
        resume_years_match = None
        for exp in self.resume_result.get("experience", []):
            m = re.search(r'(\d+)\s+years?', exp.lower())
            if m:
                resume_years_match = m
                break
        if not job_years_match or not resume_years_match:
            return 0
        job_years = int(job_years_match.group(1))
        resume_years = int(resume_years_match.group(1))
        return 100 if resume_years >= job_years else 0

    def education(self):
        job_edu_keywords = ['bachelor', 'master', 'phd', 'degree', 'diploma','graduation']
        resume_edu = " ".join(self.resume_result.get("education", [])).lower()
        for kw in job_edu_keywords:
            if kw in self.education_data and kw in resume_edu:
                return 100
        return 0

    def total_score(self):
        skill_score = self.skill()
        exp_score = self.experience()
        edu_score = self.education()
        return f"{(skill_score + exp_score + edu_score) / 3}%"


# -----------------------
# ✅ Main entry for Node.js
# -----------------------
def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        return

    file_path = sys.argv[1]
    try:
        parser = ResumeParserModel(None, None)  # ML model abhi pass nahi kar rahe
        text = parser.pdf_text(file_path)
        if not text.strip():
            print(json.dumps({"error": "No text extracted from PDF"}))
            return
        parsed = parser.parse(text)
        print(json.dumps(parsed))  # ✅ Always return JSON
    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main()
