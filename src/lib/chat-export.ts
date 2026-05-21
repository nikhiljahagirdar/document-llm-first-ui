import * as XLSX from "xlsx"
import { ChatMessage } from "./chat-store"
import { marked } from "marked"

export async function exportToCSV(messages: ChatMessage[], filename: string = "chat-history.csv") {
  const aiMessages = messages.filter(msg => msg.role === "ai")
  const data = aiMessages.map((msg, index) => ({
    No: index + 1,
    Speaker: "AI Agent",
    Message: msg.text.replace(/<\/?[^>]+(>|$)/g, ""), // strip html tags for csv
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportToExcel(messages: ChatMessage[], filename: string = "chat-history.xlsx") {
  const aiMessages = messages.filter(msg => msg.role === "ai")
  const data = aiMessages.map((msg, index) => ({
    "No": index + 1,
    "Speaker": "AI Agent",
    "Message": msg.text.replace(/<\/?[^>]+(>|$)/g, ""), // cleaner for excel
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Chat History")
  
  XLSX.writeFile(wb, filename)
}

export async function exportToWord(messages: ChatMessage[], filename: string = "chat-history.doc") {
  const aiMessages = messages.filter(msg => msg.role === "ai")
  let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>AI Chat Session</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; font-size: 12pt; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 30px; }
        .title { color: #4f46e5; font-size: 20pt; font-weight: bold; }
        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .user { background-color: #f3f4f6; border-left: 4px solid #9ca3af; }
        .ai { background-color: #e0e7ff; border-left: 4px solid #4f46e5; }
        .role { font-weight: bold; font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; color: #6b7280; }
        .content { margin-top: 5px; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1, h2, h3, h4 { color: #111827; }
        pre { background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; }
        code { font-family: monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 2px; }
        ul, ol { margin: 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">Intelligence Chat Session</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
  `

  for (const msg of aiMessages) {
    const formattedHtml = await marked.parse(msg.text)
    html += `
      <div class="message ai">
        <div class="role">AI Intelligence</div>
        <div class="content">${formattedHtml}</div>
      </div>
    `
  }

  html += `</body></html>`

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportToPDF(messages: ChatMessage[], filename: string = "chat-history.pdf") {
  const aiMessages = messages.filter(msg => msg.role === "ai")
  // Trigger browser native print on a temporary element
  const printFrame = document.createElement("iframe")
  printFrame.style.position = "fixed"
  printFrame.style.right = "0"
  printFrame.style.bottom = "0"
  printFrame.style.width = "0"
  printFrame.style.height = "0"
  printFrame.style.border = "0"
  
  document.body.appendChild(printFrame)
  
  const doc = printFrame.contentWindow?.document
  if (!doc) return

  let html = `
    <html>
    <head>
      <title>${filename}</title>
      <style>
        @page { margin: 20mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; font-size: 13px; color: #1f2937; }
        h1 { font-size: 22px; text-align: center; color: #4f46e5; margin-bottom: 5px; }
        .meta { text-align: center; font-size: 11px; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 25px; }
        .message-box { page-break-inside: avoid; margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #e5e7eb; background: #f9fafb; }
        .ai-box { border-left-color: #6366f1; background: #f5f3ff; }
        .speaker { font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; color: #4b5563; }
        .ai-box .speaker { color: #4f46e5; }
        .text { font-size: 12px; line-height: 1.5; }
        table { border-collapse: collapse; width: 100%; font-size: 11px; margin: 12px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: 700; }
        p { margin: 0 0 10px 0; }
        pre { background: #1f2937; color: #f9fafb; padding: 10px; border-radius: 4px; overflow-x: auto; font-family: monospace; }
        code { background: #f3f4f6; padding: 2px 4px; border-radius: 2px; font-family: monospace; color: #ef4444; }
        pre code { background: transparent; color: inherit; padding: 0; }
        ul, ol { margin: 0 0 10px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <h1>Intelligence Analytics Transcript</h1>
      <div class="meta">Session recorded on ${new Date().toLocaleString()}</div>
  `

  for (const msg of aiMessages) {
    const formattedHtml = await marked.parse(msg.text)
    html += `
      <div class="message-box ai-box">
        <div class="speaker">AI Agent Analysis</div>
        <div class="text">${formattedHtml}</div>
      </div>
    `
  }

  html += `
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.frameElement.remove(); }, 1000);
        };
      </script>
    </body></html>
  `

  doc.open()
  doc.write(html)
  doc.close()
}
