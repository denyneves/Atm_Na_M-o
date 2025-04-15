/* ================================================ */
/* ===== JAVASCRIPT PARA MODAIS ROBUSTOS      ===== */
/* ================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // --- Funções Utilitárias ---
    const showFeedback = (elementId, message, type = 'info', duration = 3000) => {
        const feedbackEl = document.getElementById(elementId);
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.className = `action-feedback ${type}`; // Reset classes and add type
        feedbackEl.style.display = 'block';
        setTimeout(() => {
            feedbackEl.style.display = 'none';
        }, duration);
    };

    const toggleLoading = (buttonElement, isLoading) => {
        if (!buttonElement) return;
        if (isLoading) {
            buttonElement.classList.add('loading');
            buttonElement.disabled = true;
        } else {
            buttonElement.classList.remove('loading');
            buttonElement.disabled = false;
        }
    };

    // Formatar Kwanza
    const formatKwanza = (value) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(value);
    };

    // Adicionar transação simulada à sidebar
    const addTransactionToSidebar = (description, amount, type = 'withdrawal') => {
        const list = document.getElementById('transaction-list');
        const placeholder = list.querySelector('.sidebar__transaction-placeholder');
        if(placeholder) placeholder.remove();

        const item = document.createElement('div');
        item.classList.add('sidebar__transaction');
        const iconClass = type === 'withdrawal' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'; // Exemplo
        const amountClass = type === 'withdrawal' ? 'negative' : 'positive';

        item.innerHTML = `
            <div class="sidebar__transaction-icon ${type}">
                <i class="${iconClass}"></i>
            </div>
            <div class="sidebar__transaction-details">
                <span class="sidebar__transaction-desc">${description}</span>
                <span class="sidebar__transaction-time">Agora</span>
            </div>
            <span class="sidebar__transaction-amount ${amountClass}">${formatKwanza(amount)}</span>
        `;
        // Adiciona no topo
        list.prepend(item);
    };

    // --- Modal Mapa Inteligente ---
    const modalMapa = document.getElementById('modal-mapa');
    if (modalMapa) {
        const findMeBtn = modalMapa.querySelector('#btn-find-me');
        const mapFeedback = modalMapa.querySelector('#map-feedback');
        const mapPins = modalMapa.querySelectorAll('.simulated-pin:not(.pin-user)');
        const atmDetailsContainer = modalMapa.querySelector('#atm-details');
        const rotasTrigger = modalMapa.querySelector('#modal-rotas-trigger-placeholder');
        const reportTrigger = modalMapa.querySelector('#modal-colaborativa-trigger-placeholder');
        let selectedAtmId = null; // Guarda o ID do ATM selecionado

        findMeBtn?.addEventListener('click', () => {
            toggleLoading(findMeBtn, true);
            showFeedback('map-feedback', 'Simulando busca da sua localização...', 'info', 1500);
            setTimeout(() => {
                toggleLoading(findMeBtn, false);
                 // No app real, centraria o mapa na localização do user
                showFeedback('map-feedback', 'Localização simulada encontrada!', 'success', 2000);
            }, 1500);
        });

        mapPins.forEach(pin => {
            pin.addEventListener('click', () => {
                const atmId = pin.dataset.atmId;
                const atmName = pin.dataset.atmName;
                const atmStatus = pin.dataset.atmStatus;
                const lastUpdate = pin.dataset.lastUpdate;
                const confidence = pin.dataset.confidence;
                selectedAtmId = atmId; // Armazena o ID

                let statusText = 'Indisponível';
                let statusClass = 'status--unknown';
                if (atmStatus === 'available') { statusText = 'Com Dinheiro'; statusClass = 'status--available'; }
                else if (atmStatus === 'likely') { statusText = 'Provavelmente Com Dinheiro'; statusClass = 'status--likely'; }
                else if (atmStatus === 'unavailable') { statusText = 'Sem Dinheiro'; statusClass = 'status--unavailable'; }

                atmDetailsContainer.innerHTML = `
                    <h4><i class="ri-bank-line"></i> ${atmName}</h4>
                    <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
                    <p><strong>Última Atualização:</strong> ${lastUpdate}</p>
                    <p><strong>Confiança:</strong> ${confidence}% <span class="confidence-display">(Baseado em ${atmStatus === 'available' || atmStatus === 'unavailable' ? 'reportes recentes' : 'predição e histórico'})</span></p>
                    <div class="atm-details-actions">
                        <button class="button button--primary button--small button--flex" id="btn-route-to-atm">
                            <i class="ri-route-line"></i> Ver Rota
                        </button>
                        <button class="button button--secondary button--small button--flex button--ghost" id="btn-report-atm-status">
                            <i class="ri-feedback-line"></i> Reportar Status
                        </button>
                         <button class="button button--ghost button--small button--flex" data-modal-target="#modal-status">
                            <i class="ri-pulse-line"></i> Ver Detalhes do Status
                        </button>
                    </div>
                `;

                // Adiciona listeners aos botões recém-criados
                atmDetailsContainer.querySelector('#btn-route-to-atm')?.addEventListener('click', () => {
                    // Atualiza o nome do ATM no modal de rotas antes de abrir
                    const routeTargetName = document.getElementById('route-target-atm-name');
                    if(routeTargetName) routeTargetName.textContent = atmName;
                    rotasTrigger?.click(); // Simula clique no link escondido para abrir modal de rotas
                });
                 atmDetailsContainer.querySelector('#btn-report-atm-status')?.addEventListener('click', () => {
                     // Atualiza o nome do ATM no modal colaborativo
                     const collabAtmName = document.getElementById('collab-atm-name');
                     if(collabAtmName) collabAtmName.textContent = atmName;
                     reportTrigger?.click(); // Simula clique para abrir modal de colaboração
                 });

            });
        });
    }

    // --- Modal Status Dinâmico ---
    const modalStatus = document.getElementById('modal-status');
    if (modalStatus) {
        const btnRefresh = modalStatus.querySelector('#btn-refresh-status');
        const statusTime = modalStatus.querySelector('#status-time');
        const feedbackEl = modalStatus.querySelector('#status-feedback');
        const sourcesContainer = modalStatus.querySelector('#status-sources-container');
        const consolidatedBadge = modalStatus.querySelector('#consolidated-badge');
        const statusInterpretation = modalStatus.querySelector('#status-interpretation');
        const overallConfidenceValue = modalStatus.querySelector('#overall-confidence-value');
        const overallConfidenceBar = modalStatus.querySelector('#overall-confidence-bar');
        const historyList = modalStatus.querySelector('#status-history-list');

        const updateStatusDisplay = (data) => {
             // Update sources
            sourcesContainer.querySelectorAll('.status-source').forEach(el => {
                const source = el.dataset.source;
                const detailEl = el.querySelector('.status-source-detail');
                const confFillEl = el.querySelector('.confidence-fill');
                const confValEl = el.querySelector('.confidence-value');
                if (data.sources[source]) {
                    detailEl.textContent = data.sources[source].detail;
                    confFillEl.style.width = `${data.sources[source].confidence}%`;
                    confValEl.textContent = `${data.sources[source].confidence}%`;
                    // Add confidence class (low/medium/high)
                    confFillEl.className = 'confidence-fill'; // Reset
                    if (data.sources[source].confidence < 40) confFillEl.classList.add('low');
                    else if (data.sources[source].confidence < 75) confFillEl.classList.add('medium');
                    else confFillEl.classList.add('high');
                }
            });

            // Update consolidated
            consolidatedBadge.textContent = data.consolidated.statusText;
            consolidatedBadge.className = `status-badge ${data.consolidated.statusClass}`;
            statusInterpretation.textContent = data.consolidated.interpretation;
            overallConfidenceValue.textContent = `${data.consolidated.overallConfidence}%`;
            overallConfidenceBar.style.width = `${data.consolidated.overallConfidence}%`;
             overallConfidenceBar.className = 'confidence-fill'; // Reset
             if (data.consolidated.overallConfidence < 40) overallConfidenceBar.classList.add('low');
             else if (data.consolidated.overallConfidence < 75) overallConfidenceBar.classList.add('medium');
             else overallConfidenceBar.classList.add('high');

             // Update history
             const placeholder = historyList.querySelector('.placeholder');
             if(placeholder) placeholder.remove();
             const historyItem = document.createElement('li');
             historyItem.innerHTML = `
                 <span class="history-status ${data.consolidated.statusClass}">${data.consolidated.statusText}</span>
                 <span class="history-time">${new Date().toLocaleTimeString('pt-BR')}</span>
             `;
             historyList.prepend(historyItem); // Add new history to top

             // Update timestamp
             statusTime.textContent = new Date().toLocaleTimeString('pt-BR');
        };

        btnRefresh?.addEventListener('click', () => {
            toggleLoading(btnRefresh, true);
            showFeedback('status-feedback', 'Simulando atualização de status...', 'info', 1500);

            // Simulação de dados recebidos
            setTimeout(() => {
                const randomStatus = Math.random();
                let simData;
                if (randomStatus < 0.5) { // Simula Disponível
                     simData = {
                        sources: {
                            community: { detail: '5 reportes "Com Dinheiro"', confidence: 90 },
                            prediction: { detail: 'prevenção de alta probabilidade', confidence: 85 },
                            verification: { detail: 'Verificado há 1h', confidence: 95 }
                        },
                        consolidated: {
                            statusText: 'Com Dinheiro', statusClass: 'status--available',
                            interpretation: 'Alta confiança de disponibilidade baseado em reportes e IA.',
                            overallConfidence: 92
                        }
                    };
                } else if (randomStatus < 0.8) { // Simula Provável
                    simData = {
                        sources: {
                            community: { detail: '1 reporte "Com Dinheiro"', confidence: 60 },
                            prediction: { detail: 'prevenção de média probabilidade', confidence: 75 },
                            verification: { detail: 'Verificado há 6h', confidence: 50 }
                        },
                        consolidated: {
                            statusText: 'Provável', statusClass: 'status--likely',
                            interpretation: 'Média confiança. Reporte antigo, mas indica chance.',
                            overallConfidence: 68
                        }
                    };
                } else { // Simula Indisponível
                     simData = {
                        sources: {
                            community: { detail: '3 reportes "Sem Dinheiro"', confidence: 88 },
                            prediction: { detail: 'prevê baixa probabilidade', confidence: 70 },
                            verification: { detail: 'Verificado há 3h', confidence: 80 }
                        },
                        consolidated: {
                            statusText: 'Sem Dinheiro', statusClass: 'status--unavailable',
                            interpretation: 'Alta confiança de indisponibilidade baseado em reportes.',
                            overallConfidence: 85
                        }
                    };
                }

                updateStatusDisplay(simData);
                toggleLoading(btnRefresh, false);
                showFeedback('status-feedback', 'Status atualizado com sucesso!', 'success', 2000);
            }, 1500);
        });
    }

     // --- Modal Rotas Otimizadas ---
    const modalRotas = document.getElementById('modal-rotas');
    if (modalRotas) {
        const optionsSelector = modalRotas.querySelector('#route-options-selector');
        const routeDistance = modalRotas.querySelector('#route-distance');
        const routeTime = modalRotas.querySelector('#route-time');
        const routeCost = modalRotas.querySelector('#route-cost');
        const routeSafety = modalRotas.querySelector('#route-safety');
        const routeSafetyIndicator = modalRotas.querySelector('.safety-indicator');
        const routeTraffic = modalRotas.querySelector('#route-traffic');
        const routePreviewImg = modalRotas.querySelector('#route-preview-img');
        const routeSummaryTitle = modalRotas.querySelector('#route-summary-details h4');
        const btnAltRoute = modalRotas.querySelector('#btn-alt-route');
        const shareButtons = modalRotas.querySelectorAll('#share-buttons button');
        const btnStartNav = modalRotas.querySelector('#btn-start-navigation');

        optionsSelector?.addEventListener('click', (e) => {
            const selectedCard = e.target.closest('.selectable-card');
            if (!selectedCard || selectedCard.classList.contains('selected')) return;

            // Desselect previous
            optionsSelector.querySelector('.selected')?.classList.remove('selected');
            // Select new
            selectedCard.classList.add('selected');

            // Update details
            const data = selectedCard.dataset;
            routeDistance.textContent = data.distance;
            routeTime.textContent = data.time;
            routeCost.textContent = data.cost === "0" ? 'Grátis' : formatKwanza(parseInt(data.cost)) || data.cost; // Format Kwanza if number
            routeSafety.textContent = data.safety;
            routeTraffic.textContent = data.traffic;
            routePreviewImg.src = data.img || 'img/route-placeholder.png'; // Update image
            routePreviewImg.alt = `Prévia da rota ${data.routeType}`;
            routeSummaryTitle.innerHTML = `<i class="ri-information-line"></i> Detalhes da Rota (${selectedCard.querySelector('span').textContent}):`;

            // Update safety indicator class
            routeSafetyIndicator.className = 'safety-indicator'; // Reset
            if (data.safety === 'Alta') routeSafetyIndicator.classList.add('safe');
            else if (data.safety === 'Média') routeSafetyIndicator.classList.add('medium');
            else if (data.safety === 'Baixa') routeSafetyIndicator.classList.add('low');

            showFeedback('route-preview-feedback', `Rota ${data.routeType} selecionada.`, 'info', 1500);
        });

        btnAltRoute?.addEventListener('click', () => {
            toggleLoading(btnAltRoute, true);
            showFeedback('alt-route-feedback', 'Simulando busca por rota alternativa...', 'info', 1500);
             setTimeout(() => {
                 toggleLoading(btnAltRoute, false);
                  showFeedback('alt-route-feedback', 'Rota alternativa encontrada (simulado)!', 'success', 2000);
                  // No app real, atualizaria o mapa e detalhes
             }, 1500);
        });

         shareButtons.forEach(button => {
            button.addEventListener('click', () => {
                const shareType = button.dataset.share;
                toggleLoading(button, true);
                showFeedback('share-feedback', `Simulando compartilhamento via ${shareType}...`, 'info', 1000);
                setTimeout(() => {
                    toggleLoading(button, false);
                    if(shareType === 'copy') {
                         showFeedback('share-feedback', 'Link da rota copiado para área de transferência (Simulado)!', 'success', 2500);
                    } else {
                        showFeedback('share-feedback', `Compartilhamento via ${shareType} iniciado (Simulado)!`, 'success', 2500);
                    }
                    // No app real, faria a integração com WhatsApp, Clipboard API ou Share API
                }, 1000);
            });
        });

        btnStartNav?.addEventListener('click', () => {
            toggleLoading(btnStartNav, true);
            showFeedback('share-feedback', 'Abrindo aplicativo de navegação (Simulado)...', 'info', 2000);
             setTimeout(() => {
                 toggleLoading(btnStartNav, false);
                 showFeedback('share-feedback', 'Navegação iniciada em app externo (Simulado)!', 'success', 2500);
                  // No app real, abriria Google Maps/Waze com as coordenadas
                  // Fecharia o modal opcionalmente
                  // const modalCloseBtn = modalRotas.querySelector('.modal__close');
                  // modalCloseBtn?.click();
             }, 2000);
        });
    }

    // --- Modal Filtros Avançados ---
    const modalFiltros = document.getElementById('modal-filtros');
    if (modalFiltros) {
        const filtersContent = modalFiltros.querySelector('#filters-content');
        const radiusSlider = modalFiltros.querySelector('#filter-radius');
        const radiusValueDisplay = modalFiltros.querySelector('#radius-value');
        const filterCountDisplay = modalFiltros.querySelector('#filter-count');
        const btnClearFilters = modalFiltros.querySelector('#btn-clear-filters');
        const btnApplyFilters = modalFiltros.querySelector('#btn-apply-filters');
        const btnSaveFilters = modalFiltros.querySelector('#btn-save-filters');
        const allCheckboxes = filtersContent.querySelectorAll('input[type="checkbox"]');
        let initialFilterState = getFilterState(); // Guarda estado inicial para comparação

        const updateRadiusDisplay = () => {
            const km = (parseInt(radiusSlider.value) / 1000).toFixed(1);
            radiusValueDisplay.textContent = `${km} km`;
        };

        const simulateFilterResults = () => {
            // Simulação MUITO básica - mais filtros = menos ATMs
            const checkedCount = Array.from(allCheckboxes).filter(cb => cb.checked && cb.id !== 'filter-service-levantamentos').length;
             const baseCount = 150;
             const count = Math.max(5, baseCount - checkedCount * 10 - (parseInt(radiusSlider.value) / 100));
            filterCountDisplay.textContent = Math.round(count);
            showFeedback('filter-apply-feedback', 'Contagem de ATMs atualizada (simulado).', 'info', 1500);
        };

        function getFilterState() {
            const state = {};
            allCheckboxes.forEach(cb => state[cb.value] = cb.checked);
            state.radius = radiusSlider.value;
            return JSON.stringify(state);
        }

        const checkFilterChanges = () => {
             const currentState = getFilterState();
             const hasChanged = currentState !== initialFilterState;
             btnClearFilters.disabled = !hasChanged;
             btnApplyFilters.disabled = !hasChanged;
        };

        radiusSlider?.addEventListener('input', () => {
            updateRadiusDisplay();
            simulateFilterResults(); // Atualiza contagem ao mudar raio
            checkFilterChanges();
        });

        filtersContent?.addEventListener('change', (e) => {
             if (e.target.matches('input[type="checkbox"]')) {
                simulateFilterResults();
                 // Lógica extra para "Todos" bancos
                 if(e.target.value === 'all' && e.target.checked) {
                      modalFiltros.querySelectorAll('.bank-filters input[type="checkbox"]').forEach(cb => {
                          if(cb.value !== 'all') cb.checked = false;
                      });
                 } else if (e.target.name === 'bank' && e.target.value !== 'all') {
                      modalFiltros.querySelector('input[value="all"]').checked = false;
                 }
                 checkFilterChanges();
             }
        });

        btnClearFilters?.addEventListener('click', () => {
            allCheckboxes.forEach(cb => cb.checked = (cb.id === 'filter-service-levantamentos')); // Reseta, mantem levantamentos
            radiusSlider.value = 1500;
            updateRadiusDisplay();
            simulateFilterResults();
            showFeedback('filter-apply-feedback', 'Filtros limpos.', 'success', 2000);
            initialFilterState = getFilterState(); // Atualiza estado inicial para o limpo
            checkFilterChanges(); // Desabilita botões
        });

         btnApplyFilters?.addEventListener('click', () => {
             toggleLoading(btnApplyFilters, true);
             showFeedback('filter-apply-feedback', 'Aplicando filtros no mapa (Simulado)...', 'info', 1500);
             setTimeout(() => {
                 toggleLoading(btnApplyFilters, false);
                 showFeedback('filter-apply-feedback', 'Filtros aplicados! Veja o mapa.', 'success', 2500);
                 initialFilterState = getFilterState(); // Estado atual é o novo "inicial"
                 checkFilterChanges(); // Desabilita botões novamente
                  // No app real, fecharia o modal e atualizaria o mapa principal
                  // const modalCloseBtn = modalFiltros.querySelector('.modal__close');
                  // modalCloseBtn?.click();
             }, 1500);
         });

         btnSaveFilters?.addEventListener('click', () => {
             toggleLoading(btnSaveFilters, true);
             showFeedback('filter-apply-feedback', 'Salvando combinação de filtros (Simulado)...', 'info', 1500);
              setTimeout(() => {
                 toggleLoading(btnSaveFilters, false);
                 showFeedback('filter-apply-feedback', 'Filtros salvos como preferência!', 'success', 2500);
                  // No app real, salvaria no perfil do usuário
             }, 1500);
         });

        // Inicializa
        updateRadiusDisplay();
        simulateFilterResults(); // Calcula contagem inicial
        checkFilterChanges(); // Verifica estado inicial dos botões
    }


    // --- Modal Simulador de Economia ---
    const modalEconomia = document.getElementById('modal-economia');
    if (modalEconomia) {
        const withdrawalAmountInput = modalEconomia.querySelector('#withdrawal-amount');
        const feePercentSlider = modalEconomia.querySelector('#informal-fee-percent');
        const feeValueDisplay = modalEconomia.querySelector('#informal-fee-value');
        const informalTotalCostEl = modalEconomia.querySelector('#informal-total-cost');
        const informalFeeAmountEl = modalEconomia.querySelector('#informal-fee-amount');
        const officialTotalCostEl = modalEconomia.querySelector('#official-total-cost');
        const instantSavingsEl = modalEconomia.querySelector('#instant-savings');
        // Para economia mensal (exemplo estático, poderia ser mais dinâmico)
        const monthlySavingsEl = modalEconomia.querySelector('#monthly-savings');
        const monthlySavingsProgress = modalEconomia.querySelector('#monthly-savings-progress');
         const securityLink = modalEconomia.querySelector('.security-link');

        const calculateSavings = () => {
            const amount = parseFloat(withdrawalAmountInput.value) || 0;
            const feePercent = parseInt(feePercentSlider.value) || 0;
            const feeAmount = amount * (feePercent / 100);
            const informalTotal = amount + feeAmount;
            const savings = feeAmount;

            feeValueDisplay.textContent = `${feePercent}%`;
            officialTotalCostEl.textContent = formatKwanza(amount);
            informalTotalCostEl.textContent = formatKwanza(informalTotal);
            informalFeeAmountEl.textContent = formatKwanza(feeAmount);
            instantSavingsEl.textContent = formatKwanza(savings);

             // Simulação de atualização de economia mensal (exemplo simples)
             const baseMonthlySavings = 42500; // Valor base do HTML
             const currentMonthSavings = baseMonthlySavings + savings; // Adiciona economia atual
             monthlySavingsEl.textContent = formatKwanza(currentMonthSavings);
             // Atualiza progresso (exemplo: meta de 100k Kz)
             const progressPercent = Math.min(100, (currentMonthSavings / 100000) * 100);
             monthlySavingsProgress.style.width = `${progressPercent}%`;

        };

        withdrawalAmountInput?.addEventListener('input', calculateSavings);
        feePercentSlider?.addEventListener('input', calculateSavings);

         // Link para modal de segurança
         securityLink?.addEventListener('click', () => {
             const targetModalId = securityLink.dataset.modalTarget;
             const targetModal = document.querySelector(targetModalId);
             const sourceModalCloseBtn = modalEconomia.querySelector('.modal__close');

             if (targetModal) {
                 // Fecha modal atual antes de abrir o outro (opcional)
                // sourceModalCloseBtn?.click();

                // Abre o modal de segurança (usa a função global do script.js se existir)
                 if (typeof openModal === 'function') {
                     openModal(targetModal);
                 } else {
                     // Fallback básico se a função global não estiver disponível
                     targetModal.classList.add('modal--open');
                     targetModal.setAttribute('aria-hidden', 'false');
                     document.body.classList.add('modal-open-body');
                     targetModal.querySelector('.modal__container').focus(); // Foco para acessibilidade
                 }
             }
         });

        // Calcula na inicialização
        calculateSavings();
    }


    // --- Modal Rede Colaborativa ---
    const modalColaborativa = document.getElementById('modal-colaborativa');
    if (modalColaborativa) {
        const reportButtons = modalColaborativa.querySelectorAll('.report-button');
        const otherIssueSection = modalColaborativa.querySelector('#other-issue-section');
        const issueDescription = modalColaborativa.querySelector('#issue-description');
        const btnSubmitIssue = modalColaborativa.querySelector('#btn-submit-issue');
        const feedbackEl = modalColaborativa.querySelector('#report-feedback-collab');
        // Gamification elements
        const collabScoreEl = modalColaborativa.querySelector('#collab-score');
        const collabReportsEl = modalColaborativa.querySelector('#collab-reports'); // Assumindo que você adicionou este elemento
        const collabBadgeIconEl = modalColaborativa.querySelector('#collab-badge-icon');
        const collabBadgeNameEl = modalColaborativa.querySelector('#collab-badge-name');
        const badgeProgressBar = modalColaborativa.querySelector('#badge-progress-bar');
        const userActivityList = modalColaborativa.querySelector('#user-activity-list');

        let currentScore = 125; // Simulação
        let currentReports = 15; // Simulação
        const pointsForNextLevel = 250; // Prata

        const updateGamification = (pointsToAdd, reportStatusText) => {
            currentScore += pointsToAdd;
            currentReports += 1;

            collabScoreEl.textContent = currentScore;
            if(collabReportsEl) collabReportsEl.textContent = currentReports; // Atualiza contagem de reportes

            // Atualiza barra de progresso e badge (exemplo)
            let currentLevel = "Bronze";
            let nextLevel = "Prata";
            let progressPercent = (currentScore / pointsForNextLevel) * 100;
            let badgeIcon = "ri-copper-coin-line";

            if (currentScore >= pointsForNextLevel && currentScore < 500) { // Atingiu Prata
                 currentLevel = "Prata";
                 nextLevel = "Ouro (500 Pts)";
                 badgeIcon = "ri-copper-diamond-line"; // ou ri-medal-line
                 progressPercent = ((currentScore - pointsForNextLevel) / (500 - pointsForNextLevel)) * 100;
            } else if (currentScore >= 500) { // Atingiu Ouro (exemplo)
                currentLevel = "Ouro";
                nextLevel = "Platina (1000 Pts)";
                 badgeIcon = "ri-trophy-line";
                 progressPercent = ((currentScore - 500) / (1000 - 500)) * 100;
            } // Adicionar mais níveis...

            collabBadgeNameEl.textContent = currentLevel;
            collabBadgeIconEl.innerHTML = `<i class="${badgeIcon}"></i>`;
            badgeProgressBar.style.width = `${Math.min(100, progressPercent)}%`;
            modalColaborativa.querySelector('.next-badge-progress small').textContent = `Próximo Nível: ${nextLevel}`;

             // Adiciona à lista de atividades recentes
             const activityItem = document.createElement('li');
             let iconClass = 'ri-question-line';
             let colorClass = '';
             if(reportStatusText.includes('Com Dinheiro')) { iconClass = 'ri-thumb-up-line'; colorClass = 'success-color';}
             else if(reportStatusText.includes('Sem Dinheiro')) { iconClass = 'ri-thumb-down-line'; colorClass = 'error-color';}
             else if(reportStatusText.includes('Problema')) { iconClass = 'ri-alert-line'; colorClass = 'warning-color';}

             activityItem.innerHTML = `<i class="${iconClass} ${colorClass}"></i> Reportou "${reportStatusText}" (+${pointsToAdd} pts)`;
             userActivityList.prepend(activityItem);
        };


        reportButtons.forEach(button => {
            button.addEventListener('click', () => {
                const status = button.dataset.status;
                const points = parseInt(button.dataset.points);
                let reportText = button.textContent.trim().split('(')[0].trim(); // Pega texto antes dos pontos

                toggleLoading(button, true);
                showFeedback('report-feedback-collab', 'Enviando seu reporte...', 'info', 1500);

                setTimeout(() => {
                    toggleLoading(button, false);

                    if (status === 'issue') {
                        otherIssueSection.style.display = 'block';
                        issueDescription.focus();
                         showFeedback('report-feedback-collab', 'Reporte "Outro Problema" recebido. Descreva abaixo se desejar.', 'success', 3000);
                         updateGamification(points, reportText); // Dá pontos mesmo sem descrição
                    } else {
                        otherIssueSection.style.display = 'none';
                        issueDescription.value = ''; // Limpa caso estivesse aberto
                         showFeedback('report-feedback-collab', `Reporte "${reportText}" enviado com sucesso! Obrigado por colaborar. (+${points} pts)`, 'success', 3000);
                         updateGamification(points, reportText);
                         // Adiciona transação simulada de "reporte" na sidebar
                         addTransactionToSidebar(`Reporte: ${reportText}`, points, 'report'); // Tipo 'report' ou outro
                    }
                }, 1500);
            });
        });

        btnSubmitIssue?.addEventListener('click', () => {
             toggleLoading(btnSubmitIssue, true);
             showFeedback('report-feedback-collab', 'Enviando descrição do problema...', 'info', 1000);
             setTimeout(() => {
                 toggleLoading(btnSubmitIssue, false);
                 showFeedback('report-feedback-collab', 'Descrição enviada. Agradecemos o detalhe!', 'success', 2500);
                 otherIssueSection.style.display = 'none'; // Esconde a seção após enviar
                 issueDescription.value = '';
             }, 1000);
        });
    }


    // --- NOVO Modal Simulação Saque ---
    const modalSaqueSim = document.getElementById('modal-saque-simulado');
     if(modalSaqueSim) {
         const amountInput = modalSaqueSim.querySelector('#sim-withdrawal-amount');
         const startBtn = modalSaqueSim.querySelector('#btn-start-sim');
         const resetBtn = modalSaqueSim.querySelector('#btn-reset-sim');
         const formalStepsList = modalSaqueSim.querySelector('#formal-steps');
         const informalStepsList = modalSaqueSim.querySelector('#informal-steps');
         const simAmountEls = modalSaqueSim.querySelectorAll('.sim-amount');
         const simFeeEls = modalSaqueSim.querySelectorAll('.sim-fee');
         const informalTotalCostElSim = modalSaqueSim.querySelector('#informal-total-cost-sim');
         const formalTimeEl = modalSaqueSim.querySelector('#formal-time');
         const informalTimeEl = modalSaqueSim.querySelector('#informal-time');
          const conclusionSection = modalSaqueSim.querySelector('.simulation-conclusion');
          const setupSection = modalSaqueSim.querySelector('.simulation-setup');
          let simInProgress = false; // Flag para evitar múltiplos cliques

         const resetSimulation = () => {
            simInProgress = false;
            startBtn.disabled = false;
            setupSection.style.display = 'flex'; // Mostra setup
            conclusionSection.style.display = 'none'; // Esconde conclusão
            [formalStepsList, informalStepsList].forEach(list => {
                 list.querySelectorAll('.step-item').forEach(item => {
                    item.className = 'step-item pending'; // Reseta classes
                    item.querySelector('.step-status i').className = 'ri-time-line'; // Reseta ícone
                 });
            });
            showFeedback('sim-start-feedback', 'Simulação reiniciada. Defina o valor e comece.', 'info', 3000);
         };

          const runStep = (listElement, stepIndex, delay) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    const steps = listElement.querySelectorAll('.step-item');
                    if (stepIndex > 0) {
                        steps[stepIndex - 1].classList.remove('active');
                         steps[stepIndex - 1].classList.add('completed');
                         steps[stepIndex - 1].querySelector('.step-status i').className = 'ri-check-line'; // Ícone de concluído
                         // Adiciona classe específica para concluído informal
                         if (listElement.id === 'informal-steps') {
                             steps[stepIndex - 1].classList.add('informal-completed');
                         }
                    }
                    if (stepIndex < steps.length) {
                        steps[stepIndex].classList.remove('pending');
                        steps[stepIndex].classList.add('active');
                        steps[stepIndex].querySelector('.step-status i').className = 'ri-loader-4-line animate-spin'; // Ícone de carregando
                    }
                    resolve();
                }, delay);
            });
        };


         startBtn?.addEventListener('click', async () => {
            if (simInProgress) return;
            simInProgress = true;
            startBtn.disabled = true;
            setupSection.style.display = 'none'; // Esconde setup
            conclusionSection.style.display = 'none'; // Garante que a conclusão está escondida

             const amount = parseInt(amountInput.value);
             const feePercent = 15; // Taxa informal fixa para simulação
             const fee = amount * (feePercent / 100);
             const informalTotal = amount + fee;

             // Atualiza valores na UI
             simAmountEls.forEach(el => el.textContent = formatKwanza(amount));
             simFeeEls.forEach(el => el.textContent = formatKwanza(fee));
             informalTotalCostElSim.textContent = formatKwanza(informalTotal);

             // Simula tempos (poderiam ser mais variáveis)
             const formalTimes = [1000, 2500, 1500, 500, 500]; // ms por passo
             const informalTimes = [3000, 1000, 500, 4000, 500]; // ms por passo

             let formalTotalTime = formalTimes.reduce((a, b) => a + b, 0);
             let informalTotalTime = informalTimes.reduce((a, b) => a + b, 0);
             formalTimeEl.textContent = `~ ${Math.round(formalTotalTime / 1000 / 60)} min`;
             informalTimeEl.textContent = `~ ${Math.round(informalTotalTime / 1000 / 60)} min`;

              showFeedback('sim-start-feedback', 'Iniciando simulação comparativa...', 'info', 2000);

             // Animação dos Passos (executa em paralelo)
            const formalPromise = (async () => {
                 for (let i = 0; i < formalStepsList.querySelectorAll('.step-item').length; i++) {
                    await runStep(formalStepsList, i, formalTimes[i]);
                 }
                  // Marca último passo como concluído
                 const lastFormalStep = formalStepsList.querySelector('.step-item:last-child');
                 lastFormalStep?.classList.remove('active');
                 lastFormalStep?.classList.add('completed');
                 lastFormalStep.querySelector('.step-status i').className = 'ri-check-line';
             })();

            const informalPromise = (async () => {
                 for (let i = 0; i < informalStepsList.querySelectorAll('.step-item').length; i++) {
                     await runStep(informalStepsList, i, informalTimes[i]);
                 }
                 // Marca último passo como concluído (com estilo informal)
                 const lastInformalStep = informalStepsList.querySelector('.step-item:last-child');
                 lastInformalStep?.classList.remove('active');
                 lastInformalStep?.classList.add('completed', 'informal-completed');
                 lastInformalStep.querySelector('.step-status i').className = 'ri-check-line';
             })();

             // Espera ambas as animações terminarem
             await Promise.all([formalPromise, informalPromise]);

             conclusionSection.style.display = 'block'; // Mostra conclusão
             showFeedback('sim-start-feedback', 'Simulação concluída!', 'success', 3000);
             simInProgress = false; // Permite reiniciar

             // Adiciona transação simulada à sidebar
             addTransactionToSidebar(`Saque Formal Simulado`, -amount, 'withdrawal');
             // Poderia adicionar o custo informal também, se quisesse rastrear a "perda"
             // addTransactionToSidebar(`Taxa Informal Paga (Sim.)`, -fee, 'fee');

         });

         resetBtn?.addEventListener('click', resetSimulation);

         // Inicializa escondendo conclusão
         conclusionSection.style.display = 'none';
     }

    // Links entre modais (genérico) - Requer que a função global openModal/closeModal exista
    document.body.addEventListener('click', (e) => {
        const targetLink = e.target.closest('[data-modal-target]');
        if (targetLink && targetLink.closest('.modal')) { // Verifica se o link está DENTRO de um modal
            e.preventDefault();
            const sourceModal = targetLink.closest('.modal');
            const targetModalId = targetLink.dataset.modalTarget;
            const targetModal = document.querySelector(targetModalId);

            if (targetModal && typeof openModal === 'function' && typeof closeModal === 'function') {
                closeModal(sourceModal); // Fecha o modal atual
                 // Pequeno delay para garantir que o fechamento complete antes de abrir o próximo
                 setTimeout(() => {
                     openModal(targetModal); // Abre o modal alvo
                 }, 200); // Ajuste o delay se necessário
            } else if (targetModal) {
                // Fallback se as funções globais não existirem (menos suave)
                 sourceModal.classList.remove('modal--open');
                 sourceModal.setAttribute('aria-hidden', 'true');
                 document.body.classList.remove('modal-open-body');

                 targetModal.classList.add('modal--open');
                 targetModal.setAttribute('aria-hidden', 'false');
                 document.body.classList.add('modal-open-body');
                 targetModal.querySelector('.modal__container').focus();
            }
        }
    });


}); // Fim do DOMContentLoaded
