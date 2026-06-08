
    const activitiesContainer = document.getElementById("activitiesContainer");
    const monthInput = document.getElementById("monthInput");
    const reviewerInput = document.getElementById("reviewerInput");
    const jiraImportInput = document.getElementById("jiraImportInput");

    if(typeof pdfjsLib !== "undefined"){
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.js";
    }

    let activityCount = 0;

    function addActivity(prefill = {}) {
      activityCount++;

      const activity = document.createElement("div");
      activity.className = "activity-card";

      activity.innerHTML = `
        <div class="activity-header">
          <div class="activity-number">
            Demanda ${activityCount}
          </div>

          <button class="remove-btn" onclick="removeActivity(this)">
            Remover
          </button>
        </div>

        <div class="activity-grid">

          <div class="field" style="grid-column:1 / -1;">
            <label>Titulo da Demanda</label>
            <input type="text" class="demand-title-input" placeholder="Ex: Implantacao de novo processo interno">
          </div>

          <div class="field">
            <label>Data de Início</label>
            <input type="date" class="demand-start-input">
          </div>

          <div class="field">
            <label>Data de Término</label>
            <input type="date" class="demand-end-input">
          </div>

        </div>

        <div class="field">
          <label>Descricao da Demanda</label>

          <textarea maxlength="500" class="demand-description-input"
            placeholder="Descreva a demanda realizada..."
            oninput="updateCounter(this)"></textarea>

          <div class="char-count">
            <span>0</span>/500 caracteres
          </div>
        </div>

        <div class="field" style="margin-top:20px;">
          <label>Imagens (Opcional)</label>

          <input type="file"
            accept="image/*"
            multiple
            onchange="previewImages(event, this)">

          <div class="image-preview"></div>
        </div>

        <div class="team-section">
          <h3>Quem realizou a demanda</h3>

          <div class="people-container">
            <div class="person-input">
              <input type="text" class="person-name-input" placeholder="Nome da pessoa">
              <button type="button" class="remove-person-btn" onclick="removePerson(this)">Remover</button>
            </div>
          </div>

          <button class="small-btn" onclick="addPerson(this)">
            + Adicionar Pessoa
          </button>
        </div>
      `;

      activitiesContainer.appendChild(activity);

      fillDemandCard(activity, prefill);
      return activity;
    }

    function removeActivity(button){
      button.closest(".activity-card").remove();
    }

    function updateCounter(textarea){
      const counter = textarea.parentElement.querySelector("span");
      counter.textContent = textarea.value.length;
    }

    function previewImages(event, input){
      const preview = input.parentElement.querySelector(".image-preview");
      preview.innerHTML = "";

      Array.from(event.target.files).forEach(file => {
        const reader = new FileReader();

        reader.onload = function(e){
          const img = document.createElement("img");
          img.src = e.target.result;
          preview.appendChild(img);
        }

        reader.readAsDataURL(file);
      });
    }

    function addPerson(button){
      const teamSection = button.closest(".team-section");
      const container = teamSection.querySelector(".people-container");

      const div = document.createElement("div");
      div.className = "person-input";

      div.innerHTML = `
        <input type="text" class="person-name-input" placeholder="Nome da pessoa">
        <button type="button" class="remove-person-btn" onclick="removePerson(this)">Remover</button>
      `;

      container.appendChild(div);
    }

    function removePerson(button){
      const peopleContainer = button.closest(".people-container");
      const personEntries = peopleContainer.querySelectorAll(".person-input");

      if(personEntries.length === 1){
        personEntries[0].querySelector("input").value = "";
        return;
      }

      button.closest(".person-input").remove();
    }

    function fillDemandCard(card, prefill){
      if(!prefill || Object.keys(prefill).length === 0){
        return;
      }

      if(prefill.title){
        const titleInput = card.querySelector(".demand-title-input");
        titleInput.value = prefill.title;
      }

      if(prefill.startDate){
        const startInput = card.querySelector(".demand-start-input");
        startInput.value = prefill.startDate;
      }

      if(prefill.endDate){
        const endInput = card.querySelector(".demand-end-input");
        endInput.value = prefill.endDate;
      }

      if(prefill.description){
        const descriptionInput = card.querySelector(".demand-description-input");
        descriptionInput.value = prefill.description.slice(0, 500);
        updateCounter(descriptionInput);
      }

      if(Array.isArray(prefill.people) && prefill.people.length > 0){
        const peopleContainer = card.querySelector(".people-container");
        peopleContainer.innerHTML = "";

        prefill.people.forEach(name => {
          const personDiv = document.createElement("div");
          personDiv.className = "person-input";
          personDiv.innerHTML = `
            <input type="text" class="person-name-input" placeholder="Nome da pessoa">
            <button type="button" class="remove-person-btn" onclick="removePerson(this)">Remover</button>
          `;
          personDiv.querySelector("input").value = name;
          peopleContainer.appendChild(personDiv);
        });
      }
    }

    function escapeRegex(value){
      return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function cleanExtractedValue(value){
      return value
        .replace(/\s+/g, " ")
        .replace(/^[:\-\s]+/, "")
        .trim();
    }

    function getFieldValue(text, labels){
      for(const label of labels){
        const escapedLabel = escapeRegex(label);
        const sameLineRegex = new RegExp(escapedLabel + "\\s*:?\\s*([^\\n\\r|]+)", "i");
        const sameLineMatch = text.match(sameLineRegex);

        if(sameLineMatch && sameLineMatch[1]){
          const value = cleanExtractedValue(sameLineMatch[1]);
          if(value){
            return value;
          }
        }

        const nextLineRegex = new RegExp(escapedLabel + "\\s*:?\\s*[\\n\\r]+\\s*([^\\n\\r|]+)", "i");
        const nextLineMatch = text.match(nextLineRegex);

        if(nextLineMatch && nextLineMatch[1]){
          const value = cleanExtractedValue(nextLineMatch[1]);
          if(value){
            return value;
          }
        }
      }

      return "";
    }

    function normalizeLineBreaks(text){
      return text.replace(/\r/g, "").replace(/\u00a0/g, " ");
    }

    function extractDescription(text, doc){
      const fromDom = doc.querySelector("#description-val, .issue-data-block .user-content-block, #descriptionmodule .mod-content") ;
      if(fromDom && fromDom.textContent){
        const domText = cleanExtractedValue(normalizeLineBreaks(fromDom.textContent));
        if(domText){
          return domText;
        }
      }

      const descriptionRegex = /Descri[çc][aã]o\s*:?\s*\n([\s\S]*?)(?:\n\s*(?:Coment[áa]rios|Comentarios|Commented by|Gerado em|Tempo gasto|Estimativa|Sprint|Rank)\b|$)/i;
      const match = text.match(descriptionRegex);
      if(match && match[1]){
        return cleanExtractedValue(match[1]);
      }

      return "";
    }

    function extractTitle(text, doc){
      const domTitle = doc.querySelector("#summary-val, h1#summary-val, .issue-link, #key-val");
      if(domTitle && domTitle.textContent){
        const domText = cleanExtractedValue(domTitle.textContent);
        if(domText){
          return domText;
        }
      }

      const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
      const issueLine = lines.find(line => /[A-Z][A-Z0-9]+-\d+/.test(line));
      if(issueLine){
        const normalized = issueLine
          .replace(/^\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}\s*/i, "")
          .replace(/^\[[^\]]+\]\s*/, "")
          .trim();

        const titleOnly = normalized.replace(/^\[[^\]]+\]\s*/, "").trim();
        if(titleOnly){
          return titleOnly;
        }
      }

      return "";
    }

    function parseJiraDate(rawValue){
      if(!rawValue){
        return "";
      }

      const cleaned = rawValue.trim().toLowerCase();
      const monthMap = {
        jan: "01",
        fev: "02",
        mar: "03",
        abr: "04",
        mai: "05",
        jun: "06",
        jul: "07",
        ago: "08",
        set: "09",
        out: "10",
        nov: "11",
        dez: "12"
      };

      let match = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if(match){
        const day = match[1].padStart(2, "0");
        const month = match[2].padStart(2, "0");
        let year = match[3];
        if(year.length === 2){
          year = "20" + year;
        }
        return `${year}-${month}-${day}`;
      }

      match = cleaned.match(/(\d{1,2})\/([a-z]{3})\/(\d{2,4})/i);
      if(match){
        const day = match[1].padStart(2, "0");
        const month = monthMap[match[2].toLowerCase()];
        let year = match[3];
        if(year.length === 2){
          year = "20" + year;
        }
        if(month){
          return `${year}-${month}-${day}`;
        }
      }

      return "";
    }

    function parseJiraImport(content){
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const rawText = doc.body ? (doc.body.innerText || doc.body.textContent || "") : content;
      const text = normalizeLineBreaks(rawText || content);

      const title = extractTitle(text, doc);

      const responsavel = getFieldValue(text, ["Responsável", "Responsavel"]);
      const relator = getFieldValue(text, ["Relator", "Reporter"]);
      const criado = getFieldValue(text, ["Criado", "Created"]);
      const atualizado = getFieldValue(text, ["Atualizado", "Atualizado(a)", "Updated"]);
      const descricao = extractDescription(text, doc);

      const people = [];
      if(responsavel){
        people.push(responsavel);
      }
      if(relator && !people.some(name => name.toLowerCase() === relator.toLowerCase())){
        people.push(relator);
      }

      const cleanedText = cleanExtractedValue(text);
      const looksLikeBinaryPdf = /^%PDF-\d/i.test(cleanedText);
      const fallbackDescription = looksLikeBinaryPdf ? "" : cleanedText.slice(0, 500);

      return {
        title: title || "Demanda importada do Jira",
        description: descricao || fallbackDescription,
        startDate: parseJiraDate(criado),
        endDate: parseJiraDate(atualizado),
        reviewer: responsavel || relator,
        people
      };
    }

    async function extractTextFromPdf(file){
      if(typeof pdfjsLib === "undefined"){
        throw new Error("PDF library unavailable");
      }

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pageTexts = [];

      for(let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++){
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if(pageText){
          pageTexts.push(pageText);
        }
      }

      return pageTexts.join("\n");
    }

    async function readImportFile(file){
      const fileName = (file.name || "").toLowerCase();
      const isPdf = file.type === "application/pdf" || fileName.endsWith(".pdf");

      if(isPdf){
        return extractTextFromPdf(file);
      }

      return file.text();
    }

    function applyImportedGeneralData(data){
      if(data.reviewer){
        reviewerInput.value = data.reviewer;
      }

      if(data.endDate){
        const parts = data.endDate.split("-");
        const monthNames = [
          "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        const monthIndex = Number(parts[1]) - 1;
        const year = parts[0];

        if(monthIndex >= 0 && monthIndex < monthNames.length){
          monthInput.value = `${monthNames[monthIndex]} ${year}`;
        }
      }
    }

    jiraImportInput.addEventListener("change", async function(event){
      const file = event.target.files[0];
      if(!file){
        return;
      }

      try{
        const content = await readImportFile(file);
        const importedData = parseJiraImport(content);

        if(!content || !content.trim()){
          alert("Nao foi possivel identificar dados do Jira nesse arquivo. Exporte como HTML de impressao ou copie o conteudo completo.");
          return;
        }

        if(!importedData.description && !importedData.title){
          alert("Arquivo importado, mas sem texto legivel do Jira. Tente exportar o Jira como HTML ou PDF com texto selecionavel.");
          return;
        }

        addActivity(importedData);
        applyImportedGeneralData(importedData);
      } catch(error){
        alert("Falha ao importar arquivo do Jira. Verifique se o arquivo e HTML/TXT ou PDF com texto selecionavel.");
      } finally{
        event.target.value = "";
      }
    });

    // Logo preview
    document.getElementById("logoInput").addEventListener("change", function(event){
      const file = event.target.files[0];

      if(file){
        const reader = new FileReader();

        reader.onload = function(e){
          document.getElementById("logoPreview").innerHTML =
            `<img src="${e.target.result}" alt="Logo">`;
        }

        reader.readAsDataURL(file);
      }
    });

    // Cria primeira demanda automaticamente
    addActivity();
