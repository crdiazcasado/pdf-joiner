const dz = document.getElementById("dropzone");
const fi = document.getElementById("fileInput");
const list = document.getElementById("fileList");
const mergeBtn = document.getElementById("mergeBtn");
const clearBtn = document.getElementById("clearBtn");
const outputName = document.getElementById("outputName");

let files = [];

dz.onclick = () => fi.click();

dz.ondragover = e => {
    e.preventDefault();
    dz.classList.add("active");
};

dz.ondragleave = () => dz.classList.remove("active");

dz.ondrop = e => {
    e.preventDefault();
    dz.classList.remove("active");
    loadFiles(e.dataTransfer.files);
};

fi.onchange = () => loadFiles(fi.files);

function extractNumber(name){
    const match = name.match(/\d+/g);
    return match ? parseInt(match.join(""),10) : Infinity;
}

function loadFiles(fileList){
    for(const f of fileList){
        if(f.type === "application/pdf") files.push(f);
    }

    files.sort((a,b)=>extractNumber(a.name)-extractNumber(b.name));
    renderList();
}

function renderList(){
    list.innerHTML = files.map(f=>`• ${f.name}`).join("<br>");
    mergeBtn.style.display = files.length ? "inline-block" : "none";
    clearBtn.style.display = files.length ? "inline-block" : "none";
}

mergeBtn.onclick = async () => {
    if(!files.length) return;

    let name = outputName.value.trim();
    if(!name) name = "unido.pdf";
    if(!name.toLowerCase().endsWith(".pdf")) name += ".pdf";

    const mergedPdf = await PDFLib.PDFDocument.create();

    for(const file of files){
        const bytes = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => mergedPdf.addPage(p));
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();

    URL.revokeObjectURL(url);
};

clearBtn.onclick = () => {
    files = [];
    list.innerHTML = "";
    mergeBtn.style.display = "none";
    clearBtn.style.display = "none";
    fi.value = "";
};
