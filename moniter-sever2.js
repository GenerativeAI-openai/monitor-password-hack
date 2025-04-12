import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let usedPasswords = new Set();
try {
  const lines = fs.readFileSync("output.txt", "utf8").split("\n").filter(Boolean);
  lines.forEach(line => usedPasswords.add(line.trim()));
  console.log(`${usedPasswords.size}개의 기존 비밀번호 로딩됨`);
} catch {
  console.log("기존 비밀번호 없음 (output.txt 없음)");
}

function generateUniquePassword() {
  let password;
  do {
    //password = Math.floor(10000 + Math.random() * 90000).toString();
      //password = Math.floor(10000 + 1000 + Math.random() * 9000).toString();
      password = Math.floor(10000 + 7000 + 100 + Math.random() * 900).toString();
  } while (usedPasswords.has(password));
  return password;
}

app.post("/proxy/cancel", async (req, res) => {
  try {
    const password = generateUniquePassword();
    const { sessionId, activityId } = req.body;

    fs.appendFileSync("output.txt", `${password}\n`, "utf8");
    usedPasswords.add(password);

    console.log("요청 정보:", { sessionId, password, activityId });

    const response = await fetch("https://zone60-catassessment.renaissance-go.com/v1/ar/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjgwNzk0RDA1REUwQkFCMEMwNDNBRTBDQUExQ0I5OTFBQ0Q1NzBDOUZSUzI1NiIsIng1dCI6ImdIbE5CZDRMcXd3RU91REtvY3VaR3MxWERKOCIsInR5cCI6ImF0K2p3dCJ9.eyJpc3MiOiJodHRwczovL2dsb2JhbC16b25lNjAucmVuYWlzc2FuY2UtZ28uY29tL2lkZW50aXR5c2VydmljZS9zc28iLCJuYmYiOjE3NDQyNjc3ODEsImlhdCI6MTc0NDI2Nzc4MSwiZXhwIjoxNzQ0MjcxMzgxLCJhdWQiOiJodHRwczovL2dsb2JhbC16b25lNjAucmVuYWlzc2FuY2UtZ28uY29tL2lkZW50aXR5c2VydmljZS9zc28vcmVzb3VyY2VzIiwic2NvcGUiOiJvcGVuaWQgcmVuLnByb2ZpbGUgcmVuLlJHUCIsImFtciI6WyJwd2QiXSwiY2xpZW50X2lkIjoic3R1ZGVudC1zaGVsbC1jbGllbnQiLCJzdWIiOiJiNzgxZDU5OS00YWVkLTQ2NzgtYWNhMC1lYTQ2NGUxNzhmNzYiLCJhdXRoX3RpbWUiOjE3NDQyNjc3MzcsImlkcCI6ImxvY2FsIiwidGVuYW50IjoicnBuYTMyeHUiLCJ1c2VyVHlwZSI6IlVTVFlQX1NUVURFTlQiLCJuYW1lIjoiSnVudSBMZWUgMTkxMTI5NTMiLCJjdWx0dXJlIjoiZW4tVVMiLCJyZWdpb24iOiJLUi0xMSIsImNvdW50cnkiOiJLUiIsImZlYXR1cmVTZXQiOiJVUyIsInNpZCI6IjcxNzQ1QTZDNTNCNUY1MDgwQTEyN0Q5REUyODhFRThDIn0.ASaHdzbuJs6mLDFGyw7KJTl5MDRevrF44BF5d5IIvp3Fh2-8ZOWIzPGrMWydclMhadO5pad68lU3qXBKsWxWnXpIOE5xm-kRhKyIHSJLVWWiqvPVCWLibJ-i4MKTFdt0r27vlvyyCsH11xFdpWES_alSz1HqiXOJLzP1cQOyD1gSsCpHags22Ex5CfS5GPwq2A9FnqD99sQIQ9Y550kywFYVpLyQ03t8BfjpK2uTKuwTfICOJSB_NuBNfxCo8DMxTCNKdmpIPFsP-gYb1ElXDJWN1AZt9ylZQQQjR3cbbRnWFhOdOcA0x7Ys-5ctMxwgLwnUTfksm4a7EldL_FME-Q",
        "origin": "https://global-zone60.renaissance-go.com/welcomeportal/rpna32xu"
      },
      body: JSON.stringify({ sessionId, password, activityId })
    });

    const text = await response.text();
    console.log("외부 응답:", text);

    res.status(response.status).send(text);
  } catch (err) {
    console.error("서버 오류:", err);
    res.status(500).json({ error: "서버 오류", detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});