
    const activitiesContainer = document.getElementById("activitiesContainer");
    const monthInput = document.getElementById("monthInput");
    const reviewerInput = document.getElementById("reviewerInput");
    const totalHoursValue = document.getElementById("totalHoursValue");
    const logoPreview = document.getElementById("logoPreview");
    const coverLogo = document.getElementById("coverLogo");
    const coverDateTime = document.getElementById("coverDateTime");
    const coverMonthValue = document.getElementById("coverMonthValue");
    const coverReviewerValue = document.getElementById("coverReviewerValue");
    const coverHoursValue = document.getElementById("coverHoursValue");
    const wordImportInput = document.getElementById("wordImportInput");
    const wordFileBtn = document.getElementById("wordFileBtn");
    const xmlImportInput = document.getElementById("xmlImportInput");
    const xmlFileBtn = document.getElementById("xmlFileBtn");
    const xmlTextBtn = document.getElementById("xmlTextBtn");
    const xmlTextInput = document.getElementById("xmlTextInput");

    const monthNames = [
      "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    let activityCount = 0;

    function normalizeDemandStatus(value){
      const normalized = normalizeLookupToken(value);

      if(["concluido", "concluida", "done", "finalizado", "finalizada", "resolvido", "resolved"].includes(normalized)){
        return "done";
      }

      if(["emandamento", "inprogress", "progress", "andamento", "emexecucao", "doing"].includes(normalized)){
        return "in-progress";
      }

      if(["afazer", "todo", "open", "aberto", "pendente", "backlog"].includes(normalized)){
        return "todo";
      }

      return "done";
    }

    function normalizeDemandPriority(value){
      const normalized = normalizeLookupToken(value);

      if(["highest", "high", "alta", "urgente", "critica", "critical"].includes(normalized)){
        return "high";
      }

      if(["lowest", "low", "baixa", "baixo"].includes(normalized)){
        return "low";
      }

      if(["media", "medium", "normal", "moderada"].includes(normalized)){
        return "medium";
      }

      return normalized ? "medium" : "";
    }

    function updateActivityVisualState(card){
      if(!card){
        return;
      }

      const statusInput = card.querySelector(".demand-status-input");
      const priorityInput = card.querySelector(".demand-priority-input");

      const statusValue = statusInput ? statusInput.value : "done";
      const priorityValue = priorityInput ? priorityInput.value : "";

      card.dataset.status = statusValue;
      card.dataset.priority = priorityValue;
    }

    function parseWorkedHours(value){
      if(value === null || value === undefined){
        return 0;
      }

      if(typeof value === "number"){
        return Number.isFinite(value) ? value : 0;
      }

      const raw = String(value).trim();
      if(!raw){
        return 0;
      }

      const normalized = raw.replace(/,/g, ".").toLowerCase();
      const hoursAndMinutes = normalized.match(/(\d+(?:\.\d+)?)\s*h(?:oras?)?\s*(?:(\d+)\s*m(?:in(?:utos?)?)?)?/i);
      if(hoursAndMinutes){
        const hours = Number(hoursAndMinutes[1] || 0);
        const minutes = Number(hoursAndMinutes[2] || 0);
        return hours + (minutes / 60);
      }

      const minutesOnly = normalized.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:utos?)?)?/i);
      if(minutesOnly){
        return Number(minutesOnly[1] || 0) / 60;
      }

      const plainNumber = Number(normalized);
      return Number.isFinite(plainNumber) ? plainNumber : 0;
    }

    function formatHoursValue(hours){
      const total = Math.max(0, Number(hours) || 0);
      const rounded = Math.round(total * 100) / 100;
      const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
      return `${formatted}h`;
    }

    function formatGeneratedAt(){
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
    }

    function syncPrintCover(){
      if(coverDateTime){
        coverDateTime.textContent = formatGeneratedAt();
      }

      if(coverMonthValue){
        coverMonthValue.textContent = (monthInput.value || "Não informado").trim() || "Não informado";
      }

      if(coverReviewerValue){
        coverReviewerValue.textContent = (reviewerInput.value || "Não informado").trim() || "Não informado";
      }

      if(coverHoursValue && totalHoursValue){
        coverHoursValue.textContent = totalHoursValue.textContent || "0h";
      }

      if(coverLogo && logoPreview){
        coverLogo.innerHTML = logoPreview.innerHTML;
      }
    }

    function updateTotalWorkedHours(){
      if(!totalHoursValue){
        return;
      }

      const totalHours = Array.from(activitiesContainer.querySelectorAll(".demand-hours-input"))
        .reduce((sum, input) => sum + parseWorkedHours(input.value), 0);

      totalHoursValue.textContent = formatHoursValue(totalHours);
      syncPrintCover();
    }

    function renderEmptyActivitiesState(){
      if(!activitiesContainer || activitiesContainer.children.length > 0){
        return;
      }

      activitiesContainer.innerHTML = `
        <div class="empty-activities">
          <h3>Nenhuma demanda adicionada ainda</h3>
          <p>Clique em <strong>+ Adicionar Demanda</strong> para começar ou importe um arquivo.</p>
        </div>
      `;
    }

    function clearEmptyActivitiesState(){
      const emptyState = activitiesContainer.querySelector(".empty-activities");
      if(emptyState){
        emptyState.remove();
      }
    }

    function addActivity(prefill = {}) {
      clearEmptyActivitiesState();
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
            <label>Início (data e hora)</label>
            <input type="datetime-local" class="demand-start-input">
          </div>

          <div class="field">
            <label>Término (data e hora)</label>
            <input type="datetime-local" class="demand-end-input">
          </div>

          <div class="field">
            <label>Status</label>
            <select class="demand-status-input" onchange="updateActivityStatus(this)">
              <option value="todo">A fazer</option>
              <option value="in-progress">Em andamento</option>
              <option value="done" selected>Concluída</option>
            </select>
          </div>

          <div class="field">
            <label>Prioridade</label>
            <select class="demand-priority-input" onchange="updateActivityPriority(this)">
              <option value="">Selecione</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div class="field">
            <label>Horas Trabalhadas</label>
            <input type="number" min="0" step="0.25" class="demand-hours-input" placeholder="Ex: 7" oninput="updateWorkedHours(this)">
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
      updateActivityVisualState(activity);
      updateTotalWorkedHours();
      return activity;
    }

    function removeActivity(button){
      button.closest(".activity-card").remove();
      updateTotalWorkedHours();
      renderEmptyActivitiesState();
    }

    function updateCounter(textarea){
      const counter = textarea.parentElement.querySelector("span");
      counter.textContent = textarea.value.length;
    }

    function updateActivityStatus(input){
      updateActivityVisualState(input.closest(".activity-card"));
    }

    function updateActivityPriority(input){
      updateActivityVisualState(input.closest(".activity-card"));
    }

    function updateWorkedHours(){
      updateTotalWorkedHours();
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
        startInput.value = formatDateTimeForInput(prefill.startDate);
      }

      if(prefill.endDate){
        const endInput = card.querySelector(".demand-end-input");
        endInput.value = formatDateTimeForInput(prefill.endDate);
      }

      if(prefill.status){
        const statusInput = card.querySelector(".demand-status-input");
        statusInput.value = normalizeDemandStatus(prefill.status);
      }

      if(prefill.priority){
        const priorityInput = card.querySelector(".demand-priority-input");
        priorityInput.value = normalizeDemandPriority(prefill.priority);
      }

      if(prefill.workedHours !== undefined && prefill.workedHours !== null){
        const hoursInput = card.querySelector(".demand-hours-input");
        const parsedHours = parseWorkedHours(prefill.workedHours);
        hoursInput.value = parsedHours > 0 ? String(Math.round(parsedHours * 100) / 100) : "";
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

    function getXmlFirstItem(doc){
      return doc.querySelector("rss > channel > item, item");
    }

    function normalizeLookupToken(value){
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    }

    function formatDateTimeForInput(value){
      if(!value){
        return "";
      }

      const raw = String(value).trim();
      if(!raw){
        return "";
      }

      const dateTimeLocalMatch = raw.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})(?::\d{2})?/);
      if(dateTimeLocalMatch){
        return `${dateTimeLocalMatch[1]}T${dateTimeLocalMatch[2]}`;
      }

      const dateOnlyMatch = raw.match(/^(\d{4}-\d{2}-\d{2})$/);
      if(dateOnlyMatch){
        return `${dateOnlyMatch[1]}T00:00`;
      }

      const slashDateMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::\d{2})?)?/);
      if(slashDateMatch){
        const day = slashDateMatch[1].padStart(2, "0");
        const month = slashDateMatch[2].padStart(2, "0");
        let year = slashDateMatch[3];
        if(year.length === 2){
          year = `20${year}`;
        }
        const hour = (slashDateMatch[4] || "00").padStart(2, "0");
        const minute = (slashDateMatch[5] || "00").padStart(2, "0");
        return `${year}-${month}-${day}T${hour}:${minute}`;
      }

      const dateValue = new Date(raw);
      if(!Number.isNaN(dateValue.getTime())){
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, "0");
        const day = String(dateValue.getDate()).padStart(2, "0");
        const hours = String(dateValue.getHours()).padStart(2, "0");
        const minutes = String(dateValue.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      return raw;
    }

    function extractMonthYearFromDateTime(value){
      const normalized = String(value || "").trim();
      if(!normalized){
        return "";
      }

      const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if(isoMatch){
        const year = isoMatch[1];
        const monthIndex = Number(isoMatch[2]) - 1;
        if(monthIndex >= 0 && monthIndex < monthNames.length){
          return `${monthNames[monthIndex]} ${year}`;
        }
      }

      const parsed = new Date(normalized);
      if(!Number.isNaN(parsed.getTime())){
        return `${monthNames[parsed.getMonth()]} ${parsed.getFullYear()}`;
      }

      return "";
    }

    function findXmlValue(xmlDoc, aliases){
      const normalizedAliases = aliases.map(normalizeLookupToken);
      const elements = Array.from(xmlDoc.getElementsByTagName("*"));

      for(const element of elements){
        const elementName = normalizeLookupToken(element.localName || element.tagName || "");
        if(normalizedAliases.includes(elementName)){
          const text = cleanExtractedValue(normalizeLineBreaks(element.textContent || ""));
          if(text){
            return text;
          }
        }

        for(const attribute of Array.from(element.attributes || [])){
          const attributeName = normalizeLookupToken(attribute.localName || attribute.name || "");
          if(normalizedAliases.includes(attributeName)){
            const text = cleanExtractedValue(normalizeLineBreaks(attribute.value || ""));
            if(text){
              return text;
            }
          }
        }
      }

      return "";
    }

    function findXmlValueFromRawText(text, aliases){
      for(const alias of aliases){
        const escapedAlias = escapeRegex(alias);
        const regex = new RegExp(`<\\s*${escapedAlias}[^>]*>([\\s\\S]*?)<\\s*/\\s*${escapedAlias}\\s*>`, "i");
        const match = text.match(regex);
        if(match && match[1]){
          const value = cleanExtractedValue(match[1]);
          if(value){
            return value;
          }
        }
      }

      return "";
    }

    function getXmlItemValue(itemNode, aliases){
      if(!itemNode){
        return "";
      }

      for(const alias of aliases){
        const node = itemNode.querySelector(alias.toLowerCase());
        if(node && node.textContent){
          const value = cleanExtractedValue(normalizeLineBreaks(node.textContent));
          if(value){
            return value;
          }
        }
      }

      return "";
    }

    function getXmlItemSeconds(itemNode, tagName){
      if(!itemNode){
        return 0;
      }

      const node = itemNode.querySelector(tagName);
      if(!node){
        return 0;
      }

      const secondsValue = Number(node.getAttribute("seconds") || 0);
      return Number.isFinite(secondsValue) ? secondsValue : 0;
    }

    function parseXmlImport(content){
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "application/xml");
      const parserError = xmlDoc.querySelector("parsererror");
      if(parserError){
        return {
          title: "Demanda importada do XML",
          description: normalizeLineBreaks(content).trim().slice(0, 500),
          startDate: "",
          endDate: "",
          reviewer: "",
          people: []
        };
      }

      const itemNode = getXmlFirstItem(xmlDoc) || xmlDoc;
      const title = getXmlItemValue(itemNode, ["summary", "title"]) || "Demanda importada do XML";
      const descricaoNode = itemNode.querySelector("description");
      const descricao = descricaoNode && descricaoNode.textContent
        ? cleanExtractedValue(normalizeLineBreaks(descricaoNode.textContent))
        : "";
      const inicio = getXmlItemValue(itemNode, ["created"]);
      const fim = getXmlItemValue(itemNode, ["resolved", "updated"]);
      const status = getXmlItemValue(itemNode, ["status"]);
      const priority = getXmlItemValue(itemNode, ["priority"]);
      const timeSpentSeconds = getXmlItemSeconds(itemNode, "timespent");
      const timeSpentText = getXmlItemValue(itemNode, ["timespent"]);
      const assigneeNode = itemNode.querySelector("assignee");
      const reporterNode = itemNode.querySelector("reporter");
      const assignee = assigneeNode && assigneeNode.textContent ? cleanExtractedValue(normalizeLineBreaks(assigneeNode.textContent)) : "";
      const reporter = reporterNode && reporterNode.textContent ? cleanExtractedValue(normalizeLineBreaks(reporterNode.textContent)) : "";
      const responsavel = assignee || reporter;

      return {
        title,
        description: descricao || cleanExtractedValue(normalizeLineBreaks(xmlDoc.documentElement.textContent || content)).slice(0, 500),
        startDate: formatDateTimeForInput(inicio),
        endDate: formatDateTimeForInput(fim),
        status,
        priority,
        workedHours: timeSpentSeconds > 0 ? (timeSpentSeconds / 3600) : parseWorkedHours(timeSpentText),
        reviewer: responsavel,
        people: responsavel ? [responsavel] : []
      };
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

    function issueToPrefill(issue){
      const title = issue.summary
        ? `${issue.key || ""} - ${issue.summary}`.replace(/^\s*-\s*/, "")
        : (issue.key || "Demanda importada do Jira");

      const descriptionParts = [];
      if(issue.description){
        descriptionParts.push(issue.description);
      }
      if(issue.status){
        descriptionParts.push(`Status: ${issue.status}`);
      }
      if(issue.priority){
        descriptionParts.push(`Prioridade: ${issue.priority}`);
      }
      if(issue.url){
        descriptionParts.push(`Jira: ${issue.url}`);
      }

      const people = [];
      if(issue.assignee){
        people.push(issue.assignee);
      }
      if(issue.reporter && !people.some(name => name.toLowerCase() === issue.reporter.toLowerCase())){
        people.push(issue.reporter);
      }

      return {
        title,
        description: descriptionParts.join("\n\n").slice(0, 500),
        startDate: issue.created || "",
        endDate: issue.updated || "",
        status: issue.status || "",
        priority: issue.priority || "",
        workedHours: issue.worklogHours || issue.timespentHours || 0,
        reviewer: issue.assignee || issue.reporter || "",
        people
      };
    }

    function hasImportedData(data){
      return Boolean(
        data && (
          data.title ||
          data.description ||
          data.startDate ||
          data.endDate ||
          data.reviewer ||
          (Array.isArray(data.people) && data.people.length > 0)
        )
      );
    }

    function parseJiraImport(content){
      const lowerContent = (content || "").toLowerCase();
      if(lowerContent.includes("<rss") || lowerContent.includes("<channel") || lowerContent.includes("<item")){
        return parseXmlImport(content);
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const rawText = doc.body ? (doc.body.innerText || doc.body.textContent || "") : content;
      const text = normalizeLineBreaks(rawText || content);

      const title = extractTitle(text, doc);

      const responsavel = getFieldValue(text, ["Responsável", "Responsavel"]);
      const relator = getFieldValue(text, ["Relator", "Reporter"]);
      const criado = getFieldValue(text, ["Criado", "Created"]);
      const atualizado = getFieldValue(text, ["Atualizado", "Atualizado(a)", "Updated"]);
      const status = getFieldValue(text, ["Status"]);
      const priority = getFieldValue(text, ["Prioridade", "Priority"]);
      const workedHours = getFieldValue(text, ["Tempo gasto", "Timespent", "Tempo trabalhado"]);
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
        status,
        priority,
        workedHours: parseWorkedHours(workedHours),
        reviewer: responsavel || relator,
        people
      };
    }

    async function readImportFile(file){
      return file.text();
    }

    async function readWordFile(file){
      const fileName = (file.name || "").toLowerCase();
      const isDocx = fileName.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if(isDocx){
        if(typeof mammoth === "undefined"){
          throw new Error("Word library unavailable");
        }

        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        return normalizeLineBreaks(result.value || "");
      }

      const fallbackText = await file.text();
      return normalizeLineBreaks(fallbackText || "");
    }

    function parseWordImport(content){
      const importedData = parseJiraImport(content);
      return {
        ...importedData,
        title: importedData.title && importedData.title !== "Demanda importada do Jira"
          ? importedData.title
          : "Demanda importada do Word"
      };
    }

    function applyImportedGeneralData(data){
      if(data.reviewer){
        reviewerInput.value = data.reviewer;
      }

      const monthLabel = extractMonthYearFromDateTime(data.endDate || data.startDate);
      if(monthLabel){
        monthInput.value = monthLabel;
      }

      syncPrintCover();
    }

    if(wordFileBtn && wordImportInput){
      wordFileBtn.addEventListener("click", function(){
        wordImportInput.click();
      });
    }

    if(wordImportInput){
      wordImportInput.addEventListener("change", async function(event){
        const file = event.target.files[0];
        if(!file){
          return;
        }

        try{
          const content = await readWordFile(file);
          const importedData = parseWordImport(content);

          if(!content || !content.trim()){
            alert("Nao foi possivel ler o arquivo Word enviado.");
            return;
          }

          if(!hasImportedData(importedData)){
            alert("Arquivo Word importado, mas sem campos reconheciveis.");
            return;
          }

          addActivity(importedData);
          applyImportedGeneralData(importedData);
        } catch(error){
          alert("Falha ao importar Word. Use preferencialmente arquivos .docx com texto selecionavel.");
        } finally{
          event.target.value = "";
        }
      });
    }

    if(xmlFileBtn && xmlImportInput){
      xmlFileBtn.addEventListener("click", function(){
        xmlImportInput.click();
      });
    }

    if(xmlImportInput){
      xmlImportInput.addEventListener("change", async function(event){
        const file = event.target.files[0];
        if(!file){
          return;
        }

        try{
          const content = await readImportFile(file);
          const importedData = parseXmlImport(content);

          if(!content || !content.trim()){
            alert("Nao foi possivel ler o XML enviado.");
            return;
          }

          if(!hasImportedData(importedData)){
            alert("XML importado, mas sem campos reconheciveis.");
            return;
          }

          addActivity(importedData);
          applyImportedGeneralData(importedData);
        } catch(error){
          alert("Falha ao importar XML. Verifique se o arquivo esta bem formado ou se o texto colado e um XML valido.");
        } finally{
          event.target.value = "";
        }
      });
    }

    if(xmlTextBtn && xmlTextInput){
      xmlTextBtn.addEventListener("click", function(){
        const content = (xmlTextInput.value || "").trim();
        if(!content){
          alert("Cole o XML antes de importar.");
          return;
        }

        try{
          const importedData = parseXmlImport(content);
          if(!hasImportedData(importedData)){
            alert("O texto colado nao trouxe campos reconheciveis de XML.");
            return;
          }

          addActivity(importedData);
          applyImportedGeneralData(importedData);
        } catch(error){
          alert("Falha ao importar o texto XML. Verifique se o conteúdo esta valido.");
        }
      });
    }

    // Logo preview
    document.getElementById("logoInput").addEventListener("change", function(event){
      const file = event.target.files[0];

      if(file){
        const reader = new FileReader();

        reader.onload = function(e){
          logoPreview.innerHTML =
            `<img src="${e.target.result}" alt="Logo">`;
          syncPrintCover();
        }

        reader.readAsDataURL(file);
      }
    });

    monthInput.addEventListener("input", syncPrintCover);
    reviewerInput.addEventListener("input", syncPrintCover);
    window.addEventListener("beforeprint", syncPrintCover);

    renderEmptyActivitiesState();
    syncPrintCover();
