const { spawn } = require("child_process");
app.post("/analyze-resume", (req, res) => {
  const { jobDescription, experience, education } = req.body;
  const resumePath = "uploads/resume.pdf";
  const process = spawn("python3", [
    "python/resume_match.py",
    resumePath,
    jobDescription,
    experience,
    education
  ]);

  let result = "";

  process.stdout.on("data", (data) => (result += data.toString()));
  process.stderr.on("data", (data) => console.error(data.toString()));

  process.on("close", () => {
    try {
      res.json(JSON.parse(result));
    } catch (e) {
      res.status(500).json({ error: "Invalid Python Output" });
    }
  });
});

// AI model ka role ya hy k post hoi v job ko applicant ki resume k sath match karwana hy or percentage bataey ga k kitnay percentage match hoa . total 2 role hain AI model k aik tu user ki upload hoi v resume jo k pdf formate may hy uss say structred keywords extract karta hy . or then uss k baad job k model say job ki decription , education or experience to user ki upload hoi v pdf k sath skills experience or education ko match karwa k score batata hy . may tumhay 2 file ka code send karon gi jo k AI nay di hain uss k sath aik env foler bhio jis may khuch cheezen hain. ab tum nay mujhy ya batana hy k may kaysaay uss k functions ko use karon gi . mujyy react dev ko API provide karni hy . or may backend nodejs k sath sequeilize orm k sath bana rahi hoon . tu ya bhi batana k upload hoi v resume k jo data structure formaate may aa raha hy ussy bhi kahin save karwana hy DB may then jo match score hy ussy bhi . tu uss k liya kaysay model generate karon . or ya bhi batao k kitni chezen dependencies install karni hoon gi mujhy .  


// Node.js team to call this function using spawn and pass 4 arguments

//  ab iss main functions bana deye hai or iss main aik file ha 
// node_call  file uss main bataya ha kai ap kis tarha call karein gai