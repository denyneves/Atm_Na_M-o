/**
 * =========================================================================
 * ATM NA MÃO - script.js - GOD TIER CONSOLIDATED & ROBUST VERSION
 * =========================================================================
 * Description: Script único e robusto para todas as páginas do site.
 *              Inclui Preloader, Menu, Tema (Modo Escuro/Claro), Efeitos de
 *              Scroll, Animações, Sliders, Modais com Simulações, Sidebar,
 *              Formulários e mais. Garante que funcionalidades só são
 *              ativadas se os elementos HTML necessários existirem na página.
 * Version: 2.0 (God Tier)
 * Author: [Seu Nome/Equipa]
 * =========================================================================
 */

'use strict';

/**
 * -------------------------------------------------------------------------
 * FUNÇÕES UTILITÁRIAS GLOBAIS
 * -------------------------------------------------------------------------
 */

/**
 * Executa uma função após o DOM estar totalmente carregado e pronto.
 * @param {function} fn - A função a ser executada.
 */
function runWhenDOMLoaded(fn) {
    if (document.readyState === 'loading') {
        // Espera pelo evento DOMContentLoaded se ainda estiver a carregar
        document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
        // Executa imediatamente se o DOM já estiver pronto
        fn();
    }
}

/**
 * Mostra feedback visual temporário (toast/snackbar style) num elemento específico.
 * @param {string} elementId - O ID do elemento HTML onde mostrar o feedback.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'info'|'success'|'error'|'warning'} type - O tipo de feedback (afeta ícone e estilo).
 * @param {number} duration - Duração em milissegundos para mostrar a mensagem.
 */
function showFeedback(elementId, message, type = 'info', duration = 3000) {
    const feedbackEl = document.getElementById(elementId);
    if (!feedbackEl) {
        // Aviso se o elemento de feedback não for encontrado
        console.warn(`Elemento de feedback não encontrado: #${elementId}`);
        return;
    }

    // Define o ícone com base no tipo de feedback
    let iconClass = 'ri-information-line'; // Padrão: info
    if (type === 'success') iconClass = 'ri-check-double-line';
    else if (type === 'error') iconClass = 'ri-error-warning-line';
    else if (type === 'warning') iconClass = 'ri-alert-line';

    // Define o conteúdo HTML e as classes CSS
    feedbackEl.innerHTML = `<i class="${iconClass}"></i> ${message}`;
    feedbackEl.className = `action-feedback feedback-${type} show`; // Garante que as classes corretas são aplicadas e a 'show' é adicionada

    // Limpa qualquer timeout anterior para evitar que a mensagem desapareça prematuramente
    if (feedbackEl.timeoutId) clearTimeout(feedbackEl.timeoutId);

    // Define um novo timeout para esconder a mensagem após a duração especificada
    feedbackEl.timeoutId = setTimeout(() => {
        feedbackEl.classList.remove('show');
        // Opcional: Limpar o conteúdo após a animação de saída (pode causar 'flash' se reaparecer rápido)
        // setTimeout(() => { if (!feedbackEl.classList.contains('show')) feedbackEl.innerHTML = ''; }, 300);
    }, duration);
}

/**
 * Controla o estado de 'loading' de um botão (desativa e mostra um indicador visual).
 * @param {HTMLElement | null} buttonElement - O elemento do botão a ser controlado.
 * @param {boolean} isLoading - `true` para ativar o estado de loading, `false` para desativar.
 */
function setLoading(buttonElement, isLoading) {
    if (!buttonElement) return; // Sai se o botão não existir
    buttonElement.classList.toggle('loading', isLoading); // Adiciona/remove a classe 'loading'
    buttonElement.disabled = isLoading; // Desativa/ativa o botão
}

/**
 * Formata um valor numérico como moeda Angolana (Kwanza - Kz).
 * @param {number} value - O valor numérico a ser formatado.
 * @returns {string} - O valor formatado (ex: "50.000 Kz"). Retorna "0 Kz" se a entrada for inválida.
 */
function formatCurrency(value) {
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
        return '0 Kz'; // Retorna um valor padrão se a entrada não for um número
    }
    // Usa Intl.NumberFormat para formatação localizada e robusta
    return new Intl.NumberFormat('pt-AO', { // 'pt-AO' para Português de Angola
        style: 'currency',
        currency: 'AOA', // Código ISO da moeda Kwanza
        minimumFractionDigits: 0, // Sem casas decimais
        maximumFractionDigits: 0
    }).format(numberValue)
      .replace('AOA', '') // Remove o código da moeda padrão
      .trim() + ' Kz'; // Adiciona o símbolo 'Kz'
}


/**
 * -------------------------------------------------------------------------
 * FUNÇÕES DE INICIALIZAÇÃO DOS MÓDULOS
 * -------------------------------------------------------------------------
 * Cada função inicializa uma parte específica da interface/funcionalidade.
 * Estas funções são chamadas dentro de `runWhenDOMLoaded` após verificações.
 */

/*=============== 1. PRELOADER ===============*/
const initPreloader = () => {
    const body = document.body;
    const preloader = document.getElementById('preloader');

    // Só executa se o preloader existir e o body tiver a classe 'preload'
    if (preloader && body.classList.contains('preload')) {
        // Espera o evento 'load' da janela (todos os recursos carregados)
        window.addEventListener('load', () => {
            preloader.classList.add('loaded'); // Adiciona classe para iniciar a animação de saída

            // Função para remover o preloader do DOM
            const removeFn = () => {
                if (preloader.parentNode) {
                    preloader.remove(); // Remove o elemento
                    body.classList.remove('preload'); // Remove a classe do body
                    console.log("ATM na Mão: Preloader Finalizado.");
                }
            };

            // Espera a transição CSS terminar antes de remover (melhor performance)
            preloader.addEventListener('transitionend', removeFn, { once: true });

            // Fallback: Remove após um tempo caso a transição não dispare (raro)
            setTimeout(() => { if (preloader && preloader.parentNode) removeFn(); }, 1200);
        });
    } else {
        // Se não houver preloader, remove a classe 'preload' imediatamente
        body.classList.remove('preload');
    }
};

/*=============== 2. MENU MOBILE ===============*/
const initMobileMenu = () => {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle'); // Botão Hambúrguer
    const navClose = document.getElementById('nav-close'); // Botão 'X'

    // Verifica se os elementos essenciais existem
    if (!navMenu || !navToggle || !navClose) {
        console.warn("ATM na Mão: Elementos do Menu Mobile não encontrados. Menu não inicializado.");
        return;
    }

    const navLinks = navMenu.querySelectorAll('.nav__link');

    // Abrir menu
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
        navToggle.setAttribute('aria-expanded', 'true'); // Para acessibilidade
    });

    // Fechar menu com o botão 'X'
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
        navToggle.setAttribute('aria-expanded', 'false'); // Para acessibilidade
    });

    // Fechar menu ao clicar num link (para navegação na mesma página)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Verifica se o menu está visível antes de o fechar
            if (navMenu.classList.contains('show-menu')) {
                navMenu.classList.remove('show-menu');
                navToggle.setAttribute('aria-expanded', 'false');
            }
            // A lógica de smooth scroll para # links é tratada separadamente
        });
    });

    console.log("ATM na Mão: Menu Mobile Inicializado.");
};

/*=============== 3. SIDEBAR DE TRANSAÇÕES ===============*/
const initSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle'); // Botão para abrir
    const sidebarClose = document.getElementById('sidebar-close'); // Botão 'X' dentro da sidebar
    const sidebarOverlay = document.getElementById('sidebar-overlay'); // Fundo escuro
    const transactionList = document.getElementById('transaction-list'); // Onde as transações aparecem

    // Verifica se todos os elementos da sidebar existem
    if (!sidebar || !sidebarToggle || !sidebarClose || !sidebarOverlay || !transactionList) {
        console.warn("ATM na Mão: Elementos da Sidebar não encontrados. Sidebar não inicializada.");
        return;
    }

    // Função para abrir a sidebar
    const openSidebar = () => {
        sidebar.classList.add('open');
        document.body.classList.add('sidebar-open-scroll-locked'); // Bloqueia scroll do body
        sidebarToggle.setAttribute('aria-expanded', 'true');
        startTransactionSimulation(); // Inicia/reinicia a simulação ao abrir
    };

    // Função para fechar a sidebar
    const closeSidebar = () => {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open-scroll-locked'); // Desbloqueia scroll
        sidebarToggle.setAttribute('aria-expanded', 'false');
        // Opcional: Parar a simulação de novas transações ao fechar
        // if (transactionInterval) clearInterval(transactionInterval);
    };

    // Adiciona listeners aos botões e overlay
    sidebarToggle.addEventListener('click', openSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // --- Lógica da Simulação de Transações ---
    const names = ["Augusto 1.", "Belmiro 2", "Ezequiel 3", "Geovane 4", "Jose 5.", "velino 6", "Antonio 7"];
    const avatars = ["img/2.png", "img/2.png", "img/2.png", "img/2.png"]; // Exemplo de caminhos
    let transactionInterval = null; // Guarda o ID do intervalo para poder limpar

    // Gera o HTML para uma única transação
    const generateTransactionHTML = (transaction) => `
        <div class="sidebar__transaction" style="animation-delay: ${transaction.delay || 0}ms">
            <img src="${transaction.avatar}" alt="Avatar de ${transaction.name.split(' ')[0]}" class="sidebar__transaction-avatar">
            <div class="sidebar__transaction-info">
                <span class="sidebar__transaction-name">${transaction.maskedName}</span>
                <div class="sidebar__transaction-details">
                    <span class="sidebar__transaction-ref">${transaction.ref}</span>
                    <span class="sidebar__transaction-time">${transaction.time}</span>
                </div>
            </div>
            <span class="sidebar__transaction-amount ${transaction.type}">${transaction.amount}</span>
        </div>
    `;

    // Simula o carregamento inicial de transações
    const simulateInitialTransactions = () => {
        let transactionsHTML = '';
        let delay = 0; // Para animação escalonada

        // Mostra um placeholder enquanto gera
        transactionList.innerHTML = '<div class="sidebar__transaction-placeholder"><i class="ri-loader-4-line animate-spin"></i> Carregando histórico...</div>';

        // Simula um delay de rede/processamento
        setTimeout(() => {
            for (let i = 0; i < 15; i++) { // Gera 15 transações iniciais
                const name = names[Math.floor(Math.random() * names.length)];
                const maskedName = name.substring(0, 3) + '**'; // Mascara o nome
                const amountRaw = Math.random() * 50000 + 500; // Valor aleatório
                const type = Math.random() > 0.7 ? 'incoming' : 'outgoing'; // 30% de entradas
                const transaction = {
                    avatar: avatars[Math.floor(Math.random() * avatars.length)],
                    name: name,
                    maskedName: maskedName,
                    ref: `Ref: ${Math.random().toString(6).substring(2, 8).toUpperCase()}`, // Ref aleatória
                    time: `${Math.floor(Math.random() * 20) + 1} min atrás`, // Tempo aleatório
                    amount: `${type === 'incoming' ? '+' : '-'}${formatCurrency(amountRaw)}`,
                    type: type,
                    delay: delay
                };
                transactionsHTML += generateTransactionHTML(transaction);
                delay += 50; // Incrementa o delay para a próxima
            }
            transactionList.innerHTML = transactionsHTML; // Insere todas de uma vez
        }, 800); // Delay de 800ms
    };

    // Inicia a simulação contínua (adiciona novas transações)
    const startTransactionSimulation = () => {
        simulateInitialTransactions(); // Carrega as transações iniciais

        // Limpa qualquer intervalo anterior para evitar múltiplos loops
        if (transactionInterval) clearInterval(transactionInterval);

        // Define um intervalo para adicionar novas transações periodicamente
        transactionInterval = setInterval(() => {
            const name = names[Math.floor(Math.random() * names.length)];
            const maskedName = name.substring(0, 3) + '**';
            const amountRaw = Math.random() * 10000 + 300;
            const type = Math.random() > 0.6 ? 'incoming' : 'outgoing'; // 40% de entradas
            const newTransaction = {
                avatar: avatars[Math.floor(Math.random() * avatars.length)],
                name: name,
                maskedName: maskedName,
                ref: `Ref: ${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                time: `Agora`, // Novas transações aparecem como 'Agora'
                amount: `${type === 'incoming' ? '+' : '-'}${formatCurrency(amountRaw)}`,
                type: type,
                delay: 0 // Sem delay para as novas
            };
            const newElementHTML = generateTransactionHTML(newTransaction);
            transactionList.insertAdjacentHTML('afterbegin', newElementHTML); // Adiciona no topo da lista

            // Remove a transação mais antiga se a lista ficar muito longa (ex: > 20 itens)
            if (transactionList.children.length > 20) {
                transactionList.lastElementChild?.remove(); // Opcional chaining (?.) para segurança
            }
            // Nota: Atualizar o 'time' das transações existentes seria complexo e custoso (performance)
            // para uma simulação, por isso é omitido aqui.

        }, Math.random() * 8000 + 5000); // Intervalo aleatório entre 5 e 13 segundos
    };

    // Nota: A simulação agora inicia quando a sidebar é aberta (`openSidebar`).

    console.log("ATM na Mão: Sidebar e Simulação de Transações Inicializados.");
};

/*=============== 4. HEADER SCROLL EFFECT ===============*/
const initHeaderScroll = () => {
    const header = document.getElementById('header');
    if (!header) return; // Sai se o header não existir

    const scrollHeaderHandler = () => {
        // Adiciona/remove a classe 'scrolled' com base na posição do scroll
        header.classList.toggle('scrolled', window.scrollY >= 50);
    };

    window.addEventListener('scroll', scrollHeaderHandler);
    scrollHeaderHandler(); // Verifica o estado inicial ao carregar a página
    console.log("ATM na Mão: Efeito de Scroll do Header Inicializado.");
};

/*=============== 5. ACTIVE LINK ON SCROLL ===============*/
const initActiveLinkScroll = () => {
    const sections = document.querySelectorAll('section[id]'); // Seleciona todas as seções com ID
    const navMenuList = document.querySelector('.nav__menu .nav__list'); // O container dos links de navegação

    if (sections.length === 0 || !navMenuList) {
        // Se não houver seções com ID ou menu, não faz nada
        return;
    }

    const scrollActiveHandler = () => {
        const scrollY = window.pageYOffset; // Posição atual do scroll vertical
        const headerHeight = document.getElementById('header')?.offsetHeight || 70;
        const offset = headerHeight + 30; // Offset para ativar o link um pouco antes da seção chegar ao topo
        let currentSectionId = null;

        // Itera sobre as seções para encontrar a que está visível
        sections.forEach(current => {
            const sectionTop = current.offsetTop - offset;
            const sectionHeight = current.offsetHeight;
            const sectionId = current.getAttribute('id');

            // Verifica se o scroll está dentro dos limites da seção (com offset)
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = sectionId;
            }
        });

        // Casos Especiais: Topo e Fim da Página
        // Se está perto do topo, antes da primeira seção
        if (!currentSectionId && scrollY < sections[0].offsetTop - offset) {
             currentSectionId = sections[0].getAttribute('id'); // Ativa o link da primeira seção (ex: 'hero')
        }
        // Se está perto do fim da página (últimos 100 pixels)
        if (!currentSectionId && scrollY >= document.body.scrollHeight - window.innerHeight - 100) {
             currentSectionId = sections[sections.length - 1].getAttribute('id'); // Ativa o link da última seção
        }

        // Atualiza a classe 'active-link' nos links do menu
        const links = navMenuList.querySelectorAll('a.nav__link');
        let activeLinkFound = false;
        links.forEach(link => {
            link.classList.remove('active-link'); // Remove de todos primeiro
            const linkHref = link.getAttribute('href');
            // Compara o href do link com o ID da seção ativa
            if (currentSectionId && linkHref === `#${currentSectionId}`) {
                link.classList.add('active-link');
                activeLinkFound = true;
            }
            // Tratamento especial para página de download (se necessário)
            // Se for a página de download e o link for para #dl-cta-final, e a seção for dl-cta-final
            if (document.body.classList.contains('download-page') && currentSectionId === 'dl-cta-final' && linkHref === '#dl-cta-final') {
                 link.classList.add('active-link');
                 activeLinkFound = true;
            }
        });

        // Fallback: Se nenhum link corresponde (raro), ativa o primeiro link ('#hero' ou similar)
        if (!activeLinkFound) {
             const firstLink = navMenuList.querySelector('a.nav__link[href^="#"]'); // Pega o primeiro link interno
             firstLink?.classList.add('active-link');
        }
    };

    window.addEventListener('scroll', scrollActiveHandler);
    scrollActiveHandler(); // Verifica o estado inicial
    console.log("ATM na Mão: Active Link on Scroll Inicializado.");
};


/*=============== 6. THEME DARK/LIGHT TOGGLE ===============*/
const initThemeSwitcher = () => {
    const themeButton = document.getElementById('theme-button');
    if (!themeButton) return; // Sai se o botão não existir

    const body = document.body;
    const lightTheme = 'light'; // Representa a ausência do atributo data-theme
    const darkTheme = 'dark';
    const darkIcon = 'ri-sun-line'; // Ícone para mostrar QUANDO o tema escuro está ATIVO (para mudar para claro)
    const lightIcon = 'ri-moon-line'; // Ícone para mostrar QUANDO o tema claro está ATIVO (para mudar para escuro)
    const themeAttribute = 'data-theme'; // O atributo HTML a ser usado (ex: <body data-theme="dark">)
    const storageKey = 'selected-theme'; // Chave no localStorage

    // Obtém o tema guardado no localStorage
    const getCurrentStoredTheme = () => localStorage.getItem(storageKey);
    // Verifica a preferência do sistema operativo
    const getSystemPreference = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme;

    // Aplica o tema ao body e atualiza o botão/ícone
    const applyTheme = (theme) => {
        const iconElement = themeButton.querySelector('i'); // Pega o elemento <i> dentro do botão

        if (theme === darkTheme) {
            body.setAttribute(themeAttribute, darkTheme); // Adiciona data-theme="dark" ao <body>
            if (iconElement) iconElement.className = `ri ${darkIcon} nav__theme-icon`; // Mostra ícone do sol
            themeButton.setAttribute('aria-label', 'Ativar modo claro'); // Texto acessível
        } else {
            body.removeAttribute(themeAttribute); // Remove o atributo para ativar o modo claro (baseado no CSS padrão)
            if (iconElement) iconElement.className = `ri ${lightIcon} nav__theme-icon`; // Mostra ícone da lua
            themeButton.setAttribute('aria-label', 'Ativar modo escuro'); // Texto acessível
        }

        // Guarda a escolha do utilizador no localStorage
        localStorage.setItem(storageKey, theme);
        console.log(`ATM na Mão: Tema alterado para ${theme}. CSS deve ter regras para 'body[data-theme="dark"]'.`);
    };

    // Determina o tema inicial: usa o guardado, ou a preferência do sistema, ou 'light' como fallback
    const initialTheme = getCurrentStoredTheme() || getSystemPreference();
    applyTheme(initialTheme); // Aplica o tema inicial

    // Adiciona o listener para o clique no botão
    themeButton.addEventListener('click', () => {
        // Verifica qual tema está APLICADO atualmente no body
        const currentAppliedTheme = body.hasAttribute(themeAttribute) ? darkTheme : lightTheme;
        // Inverte o tema
        applyTheme(currentAppliedTheme === darkTheme ? lightTheme : darkTheme);
    });

    // Opcional: Ouve mudanças na preferência do sistema (ex: se o utilizador mudar no SO)
    // Só aplica a mudança do sistema se o utilizador NÃO tiver definido uma preferência manual antes.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!getCurrentStoredTheme()) { // Só aplica se não houver preferência guardada
            applyTheme(e.matches ? darkTheme : lightTheme);
        }
    });

    console.log("ATM na Mão: Theme Switcher (Modo Escuro/Claro) Inicializado.");
};


/*=============== 7. ACCORDIONS (FAQ & Tech) ===============*/
// Função genérica para inicializar accordions
const initAccordion = (selector, allowsMultipleOpen = false) => {
    const items = document.querySelectorAll(selector);
    if (items.length === 0) return; // Sai se não encontrar itens com este seletor

    const toggleItem = (itemToToggle) => {
        const content = itemToToggle.querySelector('.faq__content, .tech-accordion__content');
        const header = itemToToggle.querySelector('.faq__header, .tech-accordion__header');
        const icon = itemToToggle.querySelector('.faq__icon, .tech-accordion__icon-toggle');

        // Verifica se os elementos essenciais (header e content) existem
        if (!content || !header) {
            console.warn("Item de Accordion inválido (falta header ou content):", itemToToggle);
            return;
        }

        const isOpen = itemToToggle.classList.contains('open');

        // 1. Fecha outros itens (se não permitir múltiplos abertos e se estiver a ABRIR este)
        if (!allowsMultipleOpen && !isOpen) {
            items.forEach(item => {
                if (item !== itemToToggle && item.classList.contains('open')) {
                    item.classList.remove('open');
                    item.querySelector('.faq__header, .tech-accordion__header')?.setAttribute('aria-expanded', 'false');
                    const otherContent = item.querySelector('.faq__content, .tech-accordion__content');
                    if (otherContent) otherContent.style.maxHeight = null; // Fecha o conteúdo
                    const otherIcon = item.querySelector('.faq__icon, .tech-accordion__icon-toggle');
                    if (otherIcon) {
                        // Garante que o ícone volta ao estado fechado (+)
                        otherIcon.classList.remove('ri-subtract-line', 'ri-close-line');
                        otherIcon.classList.add('ri-add-line');
                    }
                }
            });
        }

        // 2. Abre/Fecha o item atual
        itemToToggle.classList.toggle('open');
        header.setAttribute('aria-expanded', String(!isOpen)); // Atualiza acessibilidade
        content.style.maxHeight = isOpen ? null : content.scrollHeight + "px"; // Anima altura

        // 3. Atualiza o ícone do item atual
        if (icon) {
            icon.classList.toggle('ri-add-line', isOpen); // Se estava aberto (isOpen=true), agora fecha, mostra '+'
            icon.classList.toggle('ri-subtract-line', !isOpen); // Se estava fechado (isOpen=false), agora abre, mostra '-'
            // Pode usar ri-close-line como alternativa a ri-subtract-line se preferir
            // icon.classList.toggle('ri-close-line', !isOpen);
        }
    };

    // Adiciona listeners a cada item do accordion
    items.forEach((item) => {
        const headerEl = item.querySelector('.faq__header, .tech-accordion__header');
        if (headerEl) {
            // Listener para clique
            headerEl.addEventListener('click', () => toggleItem(item));
            // Listener para teclado (Enter ou Espaço) para acessibilidade
            headerEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Evita scroll da página com espaço
                    toggleItem(item);
                }
            });
            // Define estado inicial de acessibilidade
            headerEl.setAttribute('aria-expanded', 'false');
            headerEl.setAttribute('role', 'button'); // Define como botão
            headerEl.setAttribute('tabindex', '0'); // Torna focável
        }
        // Garante que o conteúdo está fechado inicialmente (CSS deve fazer isto, mas JS reforça)
        const contentEl = item.querySelector('.faq__content, .tech-accordion__content');
        if (contentEl) {
            contentEl.style.maxHeight = null;
        }
    });

    console.log(`ATM na Mão: Accordion Inicializado para "${selector}". Múltiplos abertos: ${allowsMultipleOpen}`);
};

/*=============== 8. SHOW SCROLL UP BUTTON ===============*/
const initScrollUp = () => {
    const btn = document.getElementById('scroll-up');
    if (!btn) return; // Sai se o botão não existir

    const scrollHandler = () => {
        // Mostra/esconde o botão baseado na posição do scroll (ex: > 400px)
        btn.classList.toggle('show-scroll', window.scrollY >= 400);
    };

    window.addEventListener('scroll', scrollHandler);
    scrollHandler(); // Verifica estado inicial
    console.log("ATM na Mão: Botão Scroll Up Inicializado.");
};

/*=============== 9. ANIMATIONS ON SCROLL (Intersection Observer) ===============*/
const initScrollAnimations = () => {
    // Seleciona todos os elementos que têm o atributo [data-animation]
    const elements = document.querySelectorAll('[data-animation]');
    if (elements.length === 0) return; // Sai se não houver elementos a animar

    // Verifica se o browser suporta IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        console.warn("IntersectionObserver não suportado. Mostrando todos os elementos animados imediatamente.");
        // Fallback: Mostra todos os elementos imediatamente se IO não for suportado
        elements.forEach(el => el.classList.add('is-visible'));
        return;
    }

    // Cria o observer
    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            // Se o elemento está a entrar na viewport
            if (entry.isIntersecting) {
                const target = entry.target;

                // Calcula o delay (do atributo data-delay ou data-stagger do pai)
                let delay = parseInt(target.dataset.delay) || 0;
                const staggerParent = target.closest('[data-stagger]'); // Procura um pai com data-stagger

                if (staggerParent) {
                    // Se encontrou um pai com stagger, calcula o delay adicional
                    const staggerAmount = parseFloat(staggerParent.dataset.stagger) || 100; // Valor do stagger em ms
                    // Encontra todos os "irmãos" (descendentes do pai com data-animation)
                    const siblings = Array.from(staggerParent.querySelectorAll('[data-animation]'));
                    const myIndex = siblings.indexOf(target); // Encontra a posição deste elemento na lista

                    if (myIndex !== -1) {
                        delay += myIndex * staggerAmount; // Adiciona delay baseado no índice
                    }
                }

                // Aplica o delay calculado ao estilo da transição
                target.style.transitionDelay = `${delay}ms`;
                // Adiciona a classe que dispara a animação (definida no CSS)
                target.classList.add('is-visible');

                // Para de observar este elemento após a animação ter sido iniciada (performance)
                instance.unobserve(target);
            }
        });
    }, {
        root: null, // Observa em relação à viewport
        rootMargin: '0px 0px -5% 0px', // Trigger um pouco antes do elemento estar totalmente visível (5% da parte de baixo)
        threshold: 0.1 // Trigger quando pelo menos 10% do elemento está visível
    });

    // Começa a observar cada elemento
    elements.forEach(el => observer.observe(el));
    console.log(`ATM na Mão: Animações de Scroll Inicializadas para ${elements.length} elementos.`);
};


/*=============== 10. SLICK CAROUSELS (jQuery Dependent) ===============*/
const initSlickSliders = () => {
    // Verifica se jQuery e Slick estão carregados
    if (typeof jQuery === 'undefined' || typeof jQuery.fn.slick === 'undefined') {
        console.warn("jQuery ou Slick Slider não carregados. A saltar inicialização de sliders.");
        return;
    }

    // Função auxiliar para inicializar um slider específico
    const initSlider = (selector, options, name) => {
        const $element = jQuery(selector); // Seleciona com jQuery

        // Só inicializa se o elemento existir E não tiver sido inicializado antes
        if ($element.length > 0 && !$element.hasClass('slick-initialized')) {
            try {
                $element.slick(options); // Inicializa o Slick com as opções dadas
                console.log(`ATM na Mão: Slick Slider Inicializado - ${name} (${selector})`);
            } catch (e) {
                console.error(`Erro ao inicializar Slick Slider (${name}) em "${selector}":`, e);
            }
        } else if ($element.length === 0) {
             // Não é um erro, apenas informa que o slider não está nesta página
             // console.log(`ATM na Mão: Target do Slick Slider "${selector}" não encontrado nesta página.`);
        }
    };

    // --- Configurações dos Sliders ---

    // Slider da secção "Vantagens" (se existir)
    initSlider('.vantagens__image-slider', {
        dots: true,          // Mostrar pontos de navegação
        arrows: false,         // Esconder setas de navegação
        infinite: true,        // Loop infinito
        speed: 1000,         // Velocidade da transição (fade)
        fade: true,          // Efeito de fade em vez de slide
        cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)', // Curva de easing suave
        autoplay: true,        // Autoplay ativo
        autoplaySpeed: 4500,   // Intervalo do autoplay
        pauseOnHover: true,    // Pausar ao passar o rato por cima
        draggable: true,       // Permitir arrastar com o rato
        swipe: true,           // Permitir swipe em mobile
        adaptiveHeight: false  // Manter altura consistente (se possível)
    }, 'Vantagens');

    // Slider da secção "Showcase" (usado na Home e Download)
    initSlider('.dl-showcase-slider', {
        dots: true,          // Mostrar pontos
        infinite: true,        // Loop infinito
        speed: 700,          // Velocidade de transição
        autoplay: true,        // Autoplay ativo
        autoplaySpeed: 5000,   // Intervalo
        slidesToShow: 3,         // Mostrar 3 slides por defeito
        slidesToScroll: 1,         // Passar 1 slide de cada vez
        centerMode: true,        // Slide central destacado
        centerPadding: '80px',    // Espaçamento para slides laterais
        arrows: true,          // Mostrar setas
        prevArrow: '<button type="button" class="slick-prev"><i class="ri-arrow-left-s-line"></i></button>', // Custom prev arrow
        nextArrow: '<button type="button" class="slick-next"><i class="ri-arrow-right-s-line"></i></button>', // Custom next arrow
        responsive: [        // Adaptação a diferentes tamanhos de ecrã
            { breakpoint: 1200, settings: { slidesToShow: 3, centerPadding: '60px' } },
            { breakpoint: 992, settings: { slidesToShow: 2, centerPadding: '50px', arrows: false } }, // Menos slides, sem setas
            { breakpoint: 768, settings: { slidesToShow: 1, centerPadding: '60px', arrows: false } }, // 1 slide, sem setas
            { breakpoint: 576, settings: { slidesToShow: 1, centerPadding: '30px', arrows: false, dots: true } }  // Mobile: 1 slide, menos padding, mantém dots
        ]
    }, 'Showcase (Home/Download)');

    // Adicionar aqui outros sliders se necessário...
    /*
    initSlider('.outro-slider-selector', {
        // ... opções ...
    }, 'Nome do Outro Slider');
    */
};


/*=============== 11. MODAL SETUP & TRIGGERS ===============*/
// Esta função configura a abertura/fecho de TODOS os modais
const initModals = () => {
    // Seleciona todos os elementos que TÊM o atributo [data-modal-target]
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    // Seleciona todos os elementos que SÃO modais (têm a classe .modal)
    const modals = document.querySelectorAll('.modal');

    if (modalTriggers.length === 0 && modals.length === 0) {
        // Não há triggers nem modais nesta página
        return;
    }

    let currentlyOpenModal = null; // Guarda a referência do modal aberto atualmente
    let previouslyFocusedElement = null; // Guarda o elemento que tinha foco antes de abrir o modal

    // --- Funções Internas ---

    // Função para ABRIR um modal específico
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId.substring(1)); // Pega o elemento pelo ID (remove o '#')

        // Verifica se o modal existe e não está já aberto
        if (!modal || modal.getAttribute('aria-hidden') === 'false') {
            console.warn(`Tentativa de abrir modal inexistente ou já aberto: ${modalId}`);
            return;
        }

        // Fecha qualquer outro modal que possa estar aberto (evita sobreposição não intencional)
        if (currentlyOpenModal) {
            closeModal(currentlyOpenModal);
        }

        // Guarda o elemento que tem foco agora, para devolver depois
        previouslyFocusedElement = document.activeElement;

        // Torna o modal visível e acessível
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('is-open');
        document.body.classList.add('modal-open-scroll-locked'); // Bloqueia scroll do body
        currentlyOpenModal = modal; // Regista como modal aberto

        // Gestão de Foco (Acessibilidade): Move o foco para dentro do modal
        // Tenta focar o primeiro elemento interativo, ou o botão de fechar, ou o próprio container
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0] || modal.querySelector('[data-modal-close]') || modal.querySelector('.modal__container');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100); // Pequeno delay para garantir transição CSS
        }

        // Adiciona listener para fechar com a tecla 'Escape'
        document.addEventListener('keydown', escapeKeyListener);
        console.log(`ATM na Mão: Modal aberto: ${modalId}`);

        // **IMPORTANTE**: Chama a função de inicialização específica para este modal (se existir)
        // Ex: Se modalId é '#modal-mapa', tenta chamar window.init_modal_mapa(modal)
        const initFuncName = `init_${modalId.substring(1).replace(/-/g, '_')}`; // Converte #modal-mapa para init_modal_mapa
        if (typeof window[initFuncName] === 'function') {
            try {
                window[initFuncName](modal); // Passa o elemento do modal para a função de init
                console.log(`-> Executada função de inicialização específica: ${initFuncName}`);
            } catch (err) {
                console.error(`Erro ao executar a função de inicialização ${initFuncName} para o modal ${modalId}:`, err);
            }
        } else {
             // console.log(`-> Nenhuma função de inicialização específica encontrada para ${modalId} (${initFuncName})`);
        }
    };

    // Função para FECHAR um modal específico
    const closeModal = (modal) => {
        // Verifica se o modal existe e está realmente aberto
        if (!modal || modal.getAttribute('aria-hidden') === 'true') {
            return;
        }

        // Torna o modal invisível e inacessível
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('is-open');
        currentlyOpenModal = null; // Remove referência

        // Remove o bloqueio de scroll do body APENAS se não houver outros modais abertos
        // (Importante para cenários de modal dentro de modal, embora não usados aqui ainda)
        if (!document.querySelector('.modal.is-open')) {
            document.body.classList.remove('modal-open-scroll-locked');
        }

        // Remove o listener da tecla 'Escape'
        document.removeEventListener('keydown', escapeKeyListener);

        // Devolve o foco ao elemento que o tinha antes do modal abrir (se existir)
        if (previouslyFocusedElement) {
            previouslyFocusedElement.focus();
            previouslyFocusedElement = null;
        }
        console.log(`ATM na Mão: Modal fechado: #${modal.id}`);
    };

    // Listener da tecla 'Escape'
    const escapeKeyListener = (e) => {
        if (e.key === 'Escape' && currentlyOpenModal) {
            closeModal(currentlyOpenModal);
        }
    };

    // --- Configuração dos Triggers (Botões/Links que abrem modais) ---
    modalTriggers.forEach(trigger => {
        const targetId = trigger.getAttribute('data-modal-target'); // Pega o ID do modal alvo (ex: '#modal-mapa')

        // Verifica se o targetId é válido
        if (!targetId || !targetId.startsWith('#')) {
            console.error(`Trigger de modal inválido. Falta data-modal-target ou não começa com #:`, trigger);
            return;
        }

        // Melhora acessibilidade para elementos que não são botões/links por natureza (ex: cards)
        if (!(trigger.tagName === 'BUTTON' || trigger.tagName === 'A')) {
             trigger.style.cursor = 'pointer';
             trigger.setAttribute('role', 'button');
             trigger.setAttribute('tabindex', '0'); // Torna focável
        }

        // Função que lida com o evento de ativação (click ou keydown)
        const handleTrigger = (e) => {
            // Impede abertura se o clique foi num link/botão REAL DENTRO do trigger
            // (Permite ter links normais dentro de uma área que também abre um modal)
            // Ignora links vazios ou botões de fechar modal.
            if (e.target.closest('a:not([href="#"]):not([href=""]):not(.modal__close), button:not([data-modal-close])')) {
                return; // Deixa o link/botão interno funcionar normalmente
            }

            e.preventDefault(); // Previne ação padrão (ex: seguir link '#')
            try {
                openModal(targetId); // Tenta abrir o modal
            } catch (err) {
                console.error(`Erro ao tentar abrir o modal "${targetId}" a partir do trigger:`, trigger, err);
            }
        };

        // Adiciona listeners ao trigger
        trigger.addEventListener('click', handleTrigger);
        trigger.addEventListener('keydown', (e) => {
            // Permite abrir com Enter ou Espaço (se não for input/textarea)
            if (e.key === 'Enter' || e.key === ' ') {
                 if(document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                     return; // Não abre se o foco estiver num input (permite usar espaço)
                 }
                handleTrigger(e);
            }
        });
    });

    // --- Configuração dos Botões de Fechar e Overlays ---
    modals.forEach(modal => {
        // Botões com [data-modal-close] dentro do modal
        const closeButtons = modal.querySelectorAll('[data-modal-close]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => closeModal(modal));
        });

        // Overlay (fundo clicável para fechar) - Assume que tem a classe .modal__overlay
        const overlay = modal.querySelector('.modal__overlay');
        if (overlay) {
            overlay.addEventListener('click', () => closeModal(modal));
        }
        // Garante estado inicial acessível
        modal.setAttribute('aria-hidden', 'true');
    });

    console.log(`ATM na Mão: Sistema de Modais Inicializado. ${modalTriggers.length} triggers e ${modals.length} modais encontrados.`);

}; // Fim de initModals


/*=============== 11.1 LÓGICA ESPECÍFICA DE CADA MODAL ===============*/
// Estas funções são chamadas pela `openModal` quando o modal correspondente é aberto.
// Cada função recebe o elemento do modal como argumento.

/**
 * Inicializa a lógica INTERNA do Modal do Mapa.
 * Chamada sempre que o #modal-mapa é aberto.
 * @param {HTMLElement} modal - O elemento do modal (#modal-mapa).
 */
window.init_modal_mapa = (modal) => {
    console.log("-> Inicializando lógica do Modal Mapa...");
    // Seleciona elementos DENTRO do modal
    const btnFindMe = modal.querySelector('#btn-find-me');
    const simulatedPins = modal.querySelectorAll('.simulated-pin:not(.pin-user)');
    const atmDetailsContainer = modal.querySelector('#atm-details');
    const mapFeedback = modal.querySelector('#map-feedback');
    const routeTriggerButton = document.getElementById('modal-rotas-trigger-placeholder'); // Botão (oculto?) que abre o modal de rotas

    // Verifica elementos essenciais
    if (!atmDetailsContainer || !mapFeedback) {
        console.error("Modal Mapa: Elementos essenciais (#atm-details, #map-feedback) não encontrados.");
        return;
    }

    // --- Reset do Estado do Modal ---
    // Limpa detalhes anteriores e mostra placeholder
    atmDetailsContainer.innerHTML = '<span class="placeholder-text"><i class="ri-cursor-line"></i> Clique num pin no mapa para ver detalhes.</span>';
    atmDetailsContainer.className = 'atm-details-dynamic'; // Remove classe 'loaded' se existir
    // Remove seleção de pins anteriores
    simulatedPins.forEach(p => p.classList.remove('selected-pin'));
    // Esconde feedback anterior
    mapFeedback.classList.remove('show');

    // --- Simulação "Encontrar-me" ---
    if (btnFindMe) {
        // Usa .onclick para garantir que substitui listeners antigos se o modal for reaberto
        btnFindMe.onclick = () => {
            setLoading(btnFindMe, true);
            showFeedback('map-feedback', 'Simulando busca de localização...', 'info', 2000);
            setTimeout(() => {
                setLoading(btnFindMe, false);
                showFeedback('map-feedback', 'Localização simulada encontrada!', 'success', 3000);
                // Adiciona um efeito visual temporário ao pin do utilizador (se existir)
                const userPin = modal.querySelector('.pin-user');
                userPin?.classList.add('pulse-marker');
                setTimeout(() => userPin?.classList.remove('pulse-marker'), 2500); // Remove após 2.5s
            }, 1500); // Simula delay da geolocalização
        };
    } else {
        console.warn("Modal Mapa: Botão #btn-find-me não encontrado.");
    }

    // --- Simulação Clique nos Pins de ATM ---
    if (simulatedPins.length > 0) {
        simulatedPins.forEach(pin => {
            pin.onclick = () => {
                const atmId = pin.dataset.atmId; // Pega o ID do ATM do atributo data-atm-id
                const atmName = pin.getAttribute('aria-label') || `ATM ${atmId}`; // Pega o nome para feedback

                // Remove seleção de outros pins e seleciona o atual
                simulatedPins.forEach(p => p.classList.remove('selected-pin'));
                pin.classList.add('selected-pin');

                // Mostra feedback de carregamento
                showFeedback('map-feedback', `Carregando detalhes para ${atmName}...`, 'info', 1000);
                atmDetailsContainer.innerHTML = '<div class="placeholder-text"><i class="ri-loader-4-line animate-spin"></i> Carregando...</div>'; // Estado de loading

                // Simula busca de dados (atraso de 600ms)
                setTimeout(() => {
                    // Dados simulados para diferentes ATMs
                    let details = { title: "ATM Desconhecido", address: "Endereço não disponível", status: "Indisponível", statusClass: "unavailable", lastReport: "N/A", distance: "-", services: [], isFavorite: false };
                    if (atmId === 'atm1') details = { title: "ATM BAI - Alvalade", address: "Rua Comandante Gika", status: "Com Dinheiro", statusClass: "available", lastReport: "Comunidade, 5 min", distance: "300m", services: ["Levant.", "Consultas"], isFavorite: false };
                    else if (atmId === 'atm2') details = { title: "ATM BFA - Sagrada Família", address: "Largo da Sagrada Família", status: "Sem Dinheiro", statusClass: "unavailable", lastReport: "Comunidade, 1h", distance: "1.2km", services: ["Levant.", "Pagamentos"], isFavorite: true };
                    else if (atmId === 'atm3') details = { title: "ATM BIC - Vila Alice", address: "Av. Hoji Ya Henda", status: "Provável", statusClass: "likely", lastReport: "Predição, 30 min", distance: "850m", services: ["Levant.", "Depósitos", "Consultas"], isFavorite: false };

                    // Gera o HTML dos detalhes
                    atmDetailsContainer.innerHTML = `
                        <div class="atm-detail-header">
                            <h4>${details.title}</h4>
                            <div class="atm-detail-actions">
                                <button class="btn-action btn-favorite ${details.isFavorite ? 'favorited' : ''}" aria-label="${details.isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}" data-atm-id="${atmId}">
                                    <i class="ri-${details.isFavorite ? 'heart-fill' : 'heart-line'}"></i>
                                </button>
                                <button class="btn-action btn-report-issue" aria-label="Reportar Problema neste ATM" data-atm-id="${atmId}"><i class="ri-flag-line"></i></button>
                            </div>
                        </div>
                        <ul class="atm-info-list">
                            <li><i class="ri-map-pin-line"></i> ${details.address}</li>
                            <li><i class="ri-pulse-line status-icon ${details.statusClass}"></i> Status: <strong>${details.status}</strong> <small>(${details.lastReport})</small></li>
                            <li><i class="ri-pin-distance-line"></i> Distância: ${details.distance} (Simulado)</li>
                        </ul>
                        <div class="atm-services-list">
                            ${details.services.map(s => `<span>${s}</span>`).join('') || '<span class="placeholder-text-small">Nenhum serviço extra listado.</span>'}
                        </div>
                        <div class="atm-detail-footer">
                             <!-- Pode adicionar aqui a hora da última atualização se relevante -->
                            <button class="button button--secondary button--small button--flex btn-show-route" data-atm-name="${details.title}">
                                Ver Rota <i class="ri-route-line"></i>
                            </button>
                        </div>
                    `;
                    atmDetailsContainer.classList.add('loaded'); // Adiciona classe para indicar que carregou

                    // Adiciona listeners aos botões DENTRO dos detalhes (recém-criados)
                    const showRouteBtn = atmDetailsContainer.querySelector('.btn-show-route');
                    const favBtn = atmDetailsContainer.querySelector('.btn-favorite');
                    const reportBtn = atmDetailsContainer.querySelector('.btn-report-issue');

                    // Botão "Ver Rota"
                    if (showRouteBtn && routeTriggerButton) {
                        showRouteBtn.onclick = () => {
                            // Opcional: Passar nome do ATM para o modal de rotas
                            const routeModalTitle = document.querySelector('#modal-rotas #route-target-atm-name');
                            if (routeModalTitle) routeModalTitle.textContent = showRouteBtn.dataset.atmName || "ATM selecionado";

                            closeModal(modal); // Fecha o modal do mapa
                            // Abre o modal de rotas após um pequeno delay (para animação de fecho)
                            setTimeout(() => {
                                // Verifica se o botão trigger existe antes de clicar
                                if (document.getElementById(routeTriggerButton.id)) {
                                    routeTriggerButton.click();
                                } else {
                                    console.error("Trigger para Modal de Rotas (#modal-rotas-trigger-placeholder) não encontrado no DOM ao tentar abrir.");
                                }
                            }, 350);
                        };
                    } else if (!routeTriggerButton) {
                        console.warn("Modal Mapa: Botão para abrir modal de rotas (#modal-rotas-trigger-placeholder) não encontrado.");
                    }

                    // Botão "Favoritar"
                    if (favBtn) {
                         favBtn.onclick = function() { // Usa function para ter acesso ao 'this'
                            const isFav = this.classList.toggle('favorited');
                            this.querySelector('i').className = `ri-${isFav ? 'heart-fill' : 'heart-line'}`; // Troca ícone
                            this.setAttribute('aria-label', isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos');
                            showFeedback('map-feedback', `ATM ${isFav ? 'adicionado aos' : 'removido dos'} favoritos!`, 'success', 2500);
                         };
                    }

                    // Botão "Reportar Problema"
                    if(reportBtn) {
                         reportBtn.onclick = () => {
                            // Ação futura: Abrir outro modal para reportar ou enviar dados
                            showFeedback('map-feedback', 'Funcionalidade "Reportar Problema" (Simulação)', 'info', 3000);
                         };
                    }

                }, 600); // Fim do setTimeout (simulação API)
            }; // Fim do pin.onclick
        });
    } else {
        console.warn("Modal Mapa: Nenhum pin de ATM simulado (.simulated-pin) encontrado.");
    }
    console.log("-> Lógica do Modal Mapa concluída.");
}; // Fim de window.init_modal_mapa

/**
 * Inicializa a lógica INTERNA do Modal de Status e Confiança.
 * Chamada sempre que o #modal-status é aberto.
 * @param {HTMLElement} modal - O elemento do modal (#modal-status).
 */
window.init_modal_status = (modal) => {
    console.log("-> Inicializando lógica do Modal Status...");
    // Seleciona elementos INTERNOS
    const btnRefresh = modal.querySelector('#btn-refresh-status');
    const statusTime = modal.querySelector('#status-time');
    const statusInterpret = modal.querySelector('#status-interpretation');
    const consolidatedBadge = modal.querySelector('#consolidated-badge');
    const overallConfValue = modal.querySelector('#overall-confidence-value');
    const overallConfBar = modal.querySelector('#overall-confidence-bar .confidence-fill'); // Seleciona a barra interna
    const historyList = modal.querySelector('#status-history-list');
    const statusFeedback = modal.querySelector('#status-feedback');

    // Seleciona elementos das fontes de dados
    const sources = {
        community: {
            el: modal.querySelector('[data-source="community"]'),
            detail: modal.querySelector('#community-detail'),
            conf: modal.querySelector('#community-confidence .confidence-fill') // Barra interna
        },
        prediction: {
            el: modal.querySelector('[data-source="prediction"]'),
            detail: modal.querySelector('#prediction-detail'),
            conf: modal.querySelector('#prediction-confidence .confidence-fill') // Barra interna
        },
        verification: {
            el: modal.querySelector('[data-source="verification"]'),
            detail: modal.querySelector('#verification-detail'),
            conf: modal.querySelector('#verification-confidence .confidence-fill') // Barra interna
        }
    };

    // Verifica elementos essenciais
    if (!btnRefresh || !statusTime || !statusInterpret || !consolidatedBadge || !overallConfValue || !overallConfBar || !historyList || !statusFeedback) {
        console.error("Modal Status: Um ou mais elementos essenciais não encontrados. Verifique IDs e estrutura HTML.");
        return;
    }

    // --- Função para Atualizar a Interface com Novos Dados ---
    const updateDisplay = (data) => {
        if (!data || !data.consolidated || !data.sources) {
            console.error("Modal Status: Dados inválidos recebidos para updateDisplay.", data);
            showFeedback('status-feedback', 'Erro ao processar dados do status.', 'error', 4000);
            return;
        }

        // Atualiza hora, badge, interpretação, confiança geral
        statusTime.textContent = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
        consolidatedBadge.textContent = data.consolidated.status || 'N/D';
        consolidatedBadge.className = `status-badge status--${data.consolidated.statusClass || 'unknown'}`;
        statusInterpret.textContent = data.consolidated.interpretation || 'Interpretação indisponível.';
        overallConfValue.textContent = `${data.consolidated.confidence || 0}%`;
        overallConfBar.style.width = `${data.consolidated.confidence || 0}%`;

        // Atualiza detalhes e barras de confiança das fontes individuais
        Object.keys(sources).forEach(key => {
            const sourceData = data.sources[key];
            const sourceElements = sources[key];
            if (sourceElements.el && sourceData) {
                if (sourceElements.detail) sourceElements.detail.textContent = sourceData.detail || 'N/D';
                if (sourceElements.conf) sourceElements.conf.style.width = `${sourceData.confidence || 0}%`;
                // Poderia adicionar classes para indicar se a fonte contribuiu significativamente, etc.
            } else if (sourceElements.el) {
                // Se o elemento existe mas não há dados, mostra N/D
                if (sourceElements.detail) sourceElements.detail.textContent = 'N/D';
                if (sourceElements.conf) sourceElements.conf.style.width = `0%`;
            }
        });

        // Adiciona entrada ao histórico (se fornecida)
        if (historyList && data.historyEntry) {
            const newItem = document.createElement('li');
            newItem.innerHTML = `<i class="${data.historyEntry.iconClass || 'ri-history-line'}"></i> ${data.historyEntry.text || 'Evento desconhecido'}`;
            // Remove placeholder "Carregando..." se existir
            const placeholder = historyList.querySelector('.placeholder');
            if (placeholder) placeholder.remove();
            // Adiciona no topo e limita o número de itens
            historyList.prepend(newItem);
            while (historyList.children.length > 5) { // Mantém apenas os últimos 5 registos
                historyList.removeChild(historyList.lastChild);
            }
        }
        // Mostra feedback de sucesso
        if(data.feedbackMessage) {
             showFeedback('status-feedback', data.feedbackMessage, 'success', 2500);
        }
    };

    // --- Lógica do Botão Refresh ---
    btnRefresh.onclick = () => {
        setLoading(btnRefresh, true);
        showFeedback('status-feedback', 'Verificando fontes de dados e recalculando...', 'info', 1500);

        // Simula busca e processamento de dados (atraso de 1.2s)
        setTimeout(() => {
            setLoading(btnRefresh, false);
            // Gera dados simulados aleatórios
            const rand = Math.random();
            let simulatedData, historyEntry;
            const confidenceCommunity = Math.floor(Math.random() * 70 + 30); // 30-100
            const confidencePrediction = Math.floor(Math.random() * 50 + 40); // 40-90
            const confidenceOverall = Math.floor((confidenceCommunity * 0.6) + (confidencePrediction * 0.4)); // Ponderado

            if (rand < 0.5) { // Simula Disponível
                simulatedData = {
                    sources: {
                        community: { detail: `Reporte: ${Math.floor(Math.random()*5)+1} min`, confidence: confidenceCommunity },
                        prediction: { detail: "Histórico: Positivo", confidence: confidencePrediction },
                        verification: { detail: "N/D", confidence: 0 }
                    },
                    consolidated: { status: "Disponível", statusClass:"available", interpretation: "Confirmado pela comunidade muito recentemente. Predição favorável.", confidence: Math.min(98, confidenceOverall + 10) }
                };
                historyEntry = { iconClass: "ri-check-line success-color", text: `Status atualizado para Disponível (${simulatedData.consolidated.confidence}%)`};
            } else if (rand < 0.8) { // Simula Provável
                simulatedData = {
                    sources: {
                        community: { detail: `Reporte: ${Math.floor(Math.random()*30)+20} min`, confidence: Math.max(20, confidenceCommunity - 30) },
                        prediction: { detail: "Histórico: Neutro", confidence: confidencePrediction },
                        verification: { detail: "N/D", confidence: 0 }
                    },
                    consolidated: { status: "Provável", statusClass:"likely", interpretation: "Baseado na predição; reporte comunitário algo antigo.", confidence: Math.max(40, confidenceOverall - 5) }
                };
                 historyEntry = { iconClass: "ri-question-line warning-color", text: `Status atualizado para Provável (${simulatedData.consolidated.confidence}%)`};
            } else { // Simula Indisponível
                simulatedData = {
                    sources: {
                        community: { detail: `Reporte: ${Math.floor(Math.random()*10)+3} min`, confidence: confidenceCommunity },
                        prediction: { detail: "Histórico: Negativo", confidence: Math.max(10, confidencePrediction - 20) },
                        verification: { detail: "N/D", confidence: 0 }
                    },
                    consolidated: { status: "Indisponível", statusClass:"unavailable", interpretation: "Comunidade reportou sem dinheiro recentemente.", confidence: Math.min(95, confidenceOverall + 5) }
                };
                 historyEntry = { iconClass: "ri-close-line error-color", text: `Status atualizado para Indisponível (${simulatedData.consolidated.confidence}%)`};
            }
            simulatedData.historyEntry = historyEntry; // Adiciona entrada de histórico
            simulatedData.feedbackMessage = "Status e Confiança Atualizados!"; // Mensagem de sucesso
            updateDisplay(simulatedData); // Atualiza a interface
        }, 1200); // Fim do setTimeout
    }; // Fim do btnRefresh.onclick

    // --- Carregamento Inicial ao Abrir o Modal ---
    // Mostra placeholders
    historyList.innerHTML = '<li class="placeholder"><i class="ri-loader-4-line animate-spin"></i> Carregando histórico...</li>';
    // Dados iniciais simulados (poderiam vir de um estado global ou API)
    const initialData = {
        sources: {
            community: { detail: "Reporte: 15 min", confidence: 85 },
            prediction: { detail: "Hist: Positivo", confidence: 60 },
            verification: { detail: "N/D", confidence: 0 }
        },
        consolidated: { status: "Provável", statusClass:"likely", interpretation: "Baseado na predição e reporte comunitário não tão recente.", confidence: 70 },
        historyEntry: null, // Sem nova entrada no histórico no carregamento inicial
        feedbackMessage: "Status carregado." // Mensagem inicial
    };

    // Simula um pequeno delay para mostrar os dados iniciais
    setTimeout(() => {
        updateDisplay(initialData);

        // Simula carregamento do histórico separadamente (um pouco depois)
        setTimeout(() => {
            if(historyList) {
                // Limpa placeholder antes de adicionar histórico real/simulado
                 const placeholder = historyList.querySelector('.placeholder');
                 if (placeholder) placeholder.remove();

                 // Adiciona itens de histórico simulados
                 historyList.innerHTML = `
                     <li><i class="ri-check-line success-color"></i> Confirmado Disponível - 1 hora atrás</li>
                     <li><i class="ri-question-line warning-color"></i> Status mudou para Provável - 4 horas atrás</li>
                     <li><i class="ri-check-line success-color"></i> Confirmado Disponível - Ontem</li>
                     <li><i class="ri-close-line error-color"></i> Reportado Indisponível - Ontem</li>
                     <li><i class="ri-check-line success-color"></i> Confirmado Disponível - 2 dias atrás</li>
                 `; // Adiciona o HTML diretamente
            }
        }, 500); // Delay adicional para histórico

    }, 300); // Pequeno delay inicial para a primeira atualização

    console.log("-> Lógica do Modal Status concluída.");
}; // Fim de window.init_modal_status


/**
 * Inicializa a lógica INTERNA do Modal de Rotas.
 * Chamada sempre que o #modal-rotas é aberto.
 * @param {HTMLElement} modal - O elemento do modal (#modal-rotas).
 */
window.init_modal_rotas = (modal) => {
    console.log("-> Inicializando lógica do Modal Rotas...");
    // Seleciona elementos INTERNOS
    const routeOptions = modal.querySelectorAll('.route-option-card'); // Cards de opção (carro, pé, etc.)
    const routePreviewImg = modal.querySelector('#map-route-visual img'); // Imagem da rota
    const routePreviewFeedback = modal.querySelector('#route-preview-feedback');
    const shareFeedback = modal.querySelector('#share-feedback');
    const btnAltRoute = modal.querySelector('#btn-alt-route');
    const btnStartNav = modal.querySelector('#btn-start-navigation');
    const shareButtons = modal.querySelectorAll('#share-buttons button');
    const targetAtmNameEl = modal.querySelector('#route-target-atm-name'); // Elemento que mostra o nome do ATM de destino

    // Elementos onde os detalhes da rota são mostrados
    const detailsElements = {
        summaryTitle: modal.querySelector('#route-summary-details h4'),
        distance: modal.querySelector('#route-distance'),
        time: modal.querySelector('#route-time'),
        cost: modal.querySelector('#route-cost'),
        safety: modal.querySelector('#route-safety'),
        safetyIndicator: modal.querySelector('#route-safety-indicator'), // O span com a bolinha colorida
        traffic: modal.querySelector('#route-traffic')
    };

    // Verifica elementos essenciais
    if (routeOptions.length === 0 || !routePreviewImg || !routePreviewFeedback || !shareFeedback || !btnStartNav) {
        console.error("Modal Rotas: Um ou mais elementos essenciais não encontrados (opções, imagem, feedbacks, botão iniciar).");
        return;
    }

    // --- Função para Atualizar a Interface com Detalhes da Rota Selecionada ---
    const updateRouteDisplay = (selectedOption) => {
        if (!selectedOption) return;

        const type = selectedOption.dataset.routeType || 'walk'; // 'car', 'walk', 'bike', 'taxi'
        const typeName = selectedOption.querySelector('span')?.textContent || 'Selecionado';

        // Atualiza título dos detalhes
        if (detailsElements.summaryTitle) detailsElements.summaryTitle.innerHTML = `<i class="ri-information-line"></i> Detalhes da Rota (${typeName})`;

        // Atualiza dados (com fallbacks)
        if (detailsElements.distance) detailsElements.distance.textContent = selectedOption.dataset.distance || '-';
        if (detailsElements.time) detailsElements.time.textContent = selectedOption.dataset.time || '-';
        if (detailsElements.cost) {
            const costValue = parseFloat(selectedOption.dataset.cost);
            detailsElements.cost.textContent = (costValue === 0) ? "Grátis" : (isNaN(costValue) ? '? Kz' : `~${formatCurrency(costValue)}`);
        }
        if (detailsElements.safety) detailsElements.safety.textContent = selectedOption.dataset.safety || 'N/D';
        if (detailsElements.traffic) {
            // Simulação simples de tráfego baseado no tipo
            let trafficText = 'N/A';
            if (type === 'car') trafficText = 'Moderado';
            else if (type === 'taxi') trafficText = 'Variável';
            else if (type === 'walk' || type === 'bike') trafficText = 'Leve';
            detailsElements.traffic.textContent = trafficText;
        }

        // Atualiza indicador de segurança (cor da bolinha)
        if (detailsElements.safetyIndicator) {
            const safetyLevel = (selectedOption.dataset.safety || 'unknown').toLowerCase(); // ex: 'alta', 'media', 'baixa'
            detailsElements.safetyIndicator.className = `safety-indicator ${safetyLevel}`; // Aplica classe CSS correspondente
        }

        // Atualiza Imagem de Pré-visualização (usando imagens placeholder)
        // Certifica-te que tens imagens como: img/route-walk-placeholder.png, img/route-car-placeholder.png, etc.
        routePreviewImg.src = `img/route-${type}-placeholder.png`;
        routePreviewImg.alt = `Pré-visualização da rota ${typeName}`; // Alt text descritivo

        // Atualiza Botão de Navegação/App
        if (btnStartNav) {
            const btnText = btnStartNav.querySelector('.button__text');
            const btnIcon = btnStartNav.querySelector('.button__icon'); // Assume que o ícone está dentro do botão
            if (btnText) btnText.textContent = type === 'taxi' ? 'Chamar TVDE' : 'Iniciar Navegação';
            if (btnIcon) btnIcon.className = `button__icon ri-${type === 'taxi' ? 'taxi-wifi' : 'navigation'}-line`; // Muda ícone (ex: ri-taxi-wifi-line ou ri-navigation-line)
        }

        // Mostra feedback
        showFeedback('route-preview-feedback', `Prévia da rota ${typeName} carregada.`, 'info', 2000);
    };

    // --- Adiciona Listeners às Opções de Transporte ---
    routeOptions.forEach(option => {
        // Usa onclick para substituir listeners anteriores
        option.onclick = () => {
            // Remove a classe 'selected' de todas as opções
            routeOptions.forEach(opt => opt.classList.remove('selected'));
            // Adiciona a classe 'selected' à opção clicada
            option.classList.add('selected');
            // Atualiza a interface com os dados desta opção
            updateRouteDisplay(option);
        };
        // Melhora acessibilidade
        option.setAttribute('role', 'radio'); // Como botões de rádio
        option.setAttribute('tabindex', '0');
        option.setAttribute('aria-checked', 'false');
    });

    // --- Estado Inicial ---
    // Encontra a opção selecionada por defeito (que tem a classe 'selected' no HTML)
    const defaultSelected = modal.querySelector('.route-option-card.selected');
    if (defaultSelected) {
        updateRouteDisplay(defaultSelected);
        defaultSelected.setAttribute('aria-checked', 'true');
    } else if (routeOptions.length > 0) {
        // Se nenhuma estiver selecionada por defeito, seleciona a primeira
        routeOptions[0].classList.add('selected');
        routeOptions[0].setAttribute('aria-checked', 'true');
        updateRouteDisplay(routeOptions[0]);
    }

    // --- Botão Rota Alternativa (Simulação) ---
    if (btnAltRoute) {
        btnAltRoute.onclick = () => {
            setLoading(btnAltRoute, true);
            showFeedback('route-preview-feedback', 'Calculando rota alternativa...', 'info', 1500);
            setTimeout(() => {
                setLoading(btnAltRoute, false);
                showFeedback('route-preview-feedback', 'Rota alternativa (simulada) encontrada!', 'success', 3000);
                // Poderia aqui alterar ligeiramente a imagem ou os detalhes (distância/tempo)
                // Ex: if(detailsElements.distance) detailsElements.distance.textContent += " (Alt.)";
            }, 1000);
        };
    }

    // --- Botão Iniciar Navegação / Chamar TVDE (Simulação) ---
    btnStartNav.onclick = () => {
        const selectedType = modal.querySelector('.route-option-card.selected')?.dataset.routeType;
        setLoading(btnStartNav, true);

        setTimeout(() => {
            setLoading(btnStartNav, false);
            if (selectedType === 'taxi') {
                showFeedback('share-feedback', 'Abrindo app TVDE preferido... (Simulação)', 'success', 3000);
                // Tentativa real (exemplo para Yango - pode não funcionar sem o app):
                // window.open('yango://', '_blank');
            } else {
                showFeedback('share-feedback', 'Iniciando navegação no app de mapas... (Simulação)', 'success', 3000);
                // Tentativa real (exemplo para Google Maps - precisa de lat/lon ou endereço):
                // const destination = targetAtmNameEl?.textContent || "Destino";
                // window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=${selectedType || 'walking'}`, '_blank');
            }
            // Opcional: Fechar o modal após iniciar a navegação
            // closeModal(modal);
        }, 1500); // Simula tempo de abertura do app
    };

    // --- Botões de Partilha ---
    if (shareButtons.length > 0) {
        shareButtons.forEach(button => {
            button.onclick = async () => { // Usa async para 'await'
                const shareType = button.dataset.share; // 'copy', 'native', 'whatsapp'
                const atmName = targetAtmNameEl?.textContent || "um ATM";
                const selectedOption = modal.querySelector('.route-option-card.selected');
                const routeType = selectedOption?.dataset.routeType || 'walk';
                const routeTime = selectedOption?.dataset.time || '? min';
                const routeDist = selectedOption?.dataset.distance || '? km';

                // Constrói os dados para partilha
                const shareData = {
                    title: `Direções para ${atmName} via ATM na Mão`,
                    text: `Segue a rota ${routeType === 'walk' ? 'a pé' : (routeType === 'car' ? 'de carro' : (routeType === 'bike' ? 'de bicicleta' : 'de TVDE'))} para ${atmName} (${routeDist}, ${routeTime}) encontrada no ATM na Mão:`,
                    // URL de exemplo - idealmente apontaria para uma página que mostra a rota
                    url: `${window.location.origin}${window.location.pathname}?action=showRoute&to=${encodeURIComponent(atmName)}&mode=${routeType}`
                };

                setLoading(button, true); // Mostra loading no botão específico
                try {
                    if (shareType === 'copy') {
                        // Copia a URL para a área de transferência
                        await navigator.clipboard.writeText(shareData.url);
                        showFeedback('share-feedback', 'Link da rota copiado!', 'success', 2500);
                    } else if (shareType === 'native' && navigator.share) {
                        // Usa a API de Partilha Nativa do browser (se suportada)
                        await navigator.share(shareData);
                        showFeedback('share-feedback', 'Rota partilhada com sucesso!', 'success', 2500);
                    } else if (shareType === 'whatsapp') {
                        // Abre link direto para partilha no WhatsApp
                        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
                        window.open(whatsappUrl, '_blank');
                        showFeedback('share-feedback', 'Abrindo WhatsApp...', 'info', 2000); // Não confirma se partilhou
                    } else {
                        // Fallback ou tipo não suportado
                        throw new Error('Opção de partilha não suportada ou API nativa indisponível.');
                    }
                } catch (err) {
                    console.error('Erro ao partilhar:', err);
                    showFeedback('share-feedback', `Falha ao ${shareType === 'copy' ? 'copiar' : 'partilhar'} rota.`, 'error', 3000);
                } finally {
                    setLoading(button, false); // Remove loading do botão
                }
            };
        });
    }

    console.log("-> Lógica do Modal Rotas concluída.");
}; // Fim de window.init_modal_rotas


/**
 * Inicializa a lógica INTERNA do Modal de Filtros.
 * Chamada sempre que o #modal-filtros é aberto.
 * @param {HTMLElement} modal - O elemento do modal (#modal-filtros).
 */
window.init_modal_filtros = (modal) => {
    console.log("-> Inicializando lógica do Modal Filtros...");
    // Seleciona elementos INTERNOS
    const form = modal.querySelector('#filters-content'); // O container dos filtros
    const filterCheckboxes = form?.querySelectorAll('.filter-options input[type="checkbox"]');
    const radiusSlider = form?.querySelector('#filter-radius');
    const radiusValueSpan = form?.querySelector('#radius-value');
    const btnClear = form?.querySelector('#btn-clear-filters');
    const btnApply = form?.querySelector('#btn-apply-filters');
    const btnSave = form?.querySelector('#btn-save-filters'); // Botão para salvar (novo?)
    const filterCountEl = form?.querySelector('#filter-count'); // Onde mostra a contagem de ATMs
    const filterFeedback = form?.querySelector('#filter-apply-feedback');

    // Verifica elementos essenciais
    if (!form || !filterCheckboxes || filterCheckboxes.length === 0 || !radiusSlider || !radiusValueSpan || !btnClear || !btnApply || !filterCountEl || !filterFeedback) {
        console.error("Modal Filtros: Um ou mais elementos essenciais não encontrados. Verifique IDs e estrutura HTML.");
        return;
    }

    let filtersChangedSinceLoad = false; // Flag para saber se houve mudanças
    const baseAtmCount = 85; // Nº base de ATMs para a simulação de contagem

    // --- Função para Calcular Contagem Simulada de ATMs ---
    const calculateSimulatedCount = () => {
        let count = baseAtmCount;
        const activeFilters = Array.from(filterCheckboxes).filter(cb => cb.checked);
        const radiusVal = parseInt(radiusSlider.value); // Valor atual do raio em metros

        // Lógica de simulação (MUITO simplificada)
        activeFilters.forEach(filter => {
            const filterType = filter.name; // 'bank', 'service', 'note', 'access'
            const filterValue = filter.value;

            // Reduz a contagem com base nos filtros (valores arbitrários)
            if (filterType === 'bank' && filterValue !== 'Todos') count *= 0.85; // Cada banco reduz um pouco
            if (filterType === 'service' && filterValue !== 'levantamentos') count *= 0.7; // Outros serviços reduzem mais
            if (filterType === 'note') count *= 0.9; // Filtro de nota reduz ligeiramente
            if (filterType === 'access' && filterValue !== 'todos') count *= 0.95; // Acessibilidade reduz pouco
        });

        // Efeito do raio (não linear)
        if (radiusVal < 1000) count *= 0.3;      // Raio < 1km reduz drasticamente
        else if (radiusVal < 2500) count *= 0.6; // Raio < 2.5km reduz bastante
        else if (radiusVal < 5000) count *= 0.8; // Raio < 5km reduz moderadamente

        // Arredonda e adiciona um pouco de aleatoriedade (+/- 10%)
        return Math.max(0, Math.floor(count + (Math.random() - 0.5) * (count * 0.1)));
    };

    // --- Função para Atualizar o Estado da Interface (Slider, Contagem, Botões) ---
    const updateFilterState = () => {
        // Atualiza valor do slider de raio
        if (radiusValueSpan) {
            const value = radiusSlider.value;
            const km = (value / 1000).toFixed(1).replace('.', ','); // Formata para km com vírgula
            radiusValueSpan.textContent = `${value}m (${km} km)`;

            // Atualiza visualização do preenchimento do slider (requer CSS com --value-percent)
            const min = radiusSlider.min ? parseFloat(radiusSlider.min) : 0;
            const max = radiusSlider.max ? parseFloat(radiusSlider.max) : 5000;
            const percent = ((value - min) / (max - min)) * 100;
            radiusSlider.style.setProperty('--value-percent', `${percent}%`);
        }

        // Atualiza contagem simulada
        const simulatedCount = calculateSimulatedCount();
        if (filterCountEl) filterCountEl.textContent = simulatedCount;

        // Verifica se os filtros atuais são os padrão
        // (Padrão: Só 'Levantamentos' ativo, raio em 1500m)
        const isDefault = Array.from(filterCheckboxes).every(cb =>
            cb.id === 'filter-service-levantamentos' ? cb.checked : !cb.checked
        ) && (radiusSlider.value === '1500');

        // Ativa/desativa botões com base no estado
        if (btnClear) btnClear.disabled = isDefault; // Só pode limpar se não for padrão
        if (btnApply) btnApply.disabled = !filtersChangedSinceLoad; // Só pode aplicar se houve mudanças
        if (btnSave) btnSave.disabled = isDefault; // Só pode salvar filtros não-padrão (simulação)

        // Atualiza estado ARIA dos checkboxes
        filterCheckboxes.forEach(cb => cb.setAttribute('aria-checked', String(cb.checked)));
    };

    // --- Event Listeners ---
    // Checkboxes
    filterCheckboxes.forEach(cb => {
        cb.onchange = () => {
            filtersChangedSinceLoad = true; // Marca que houve mudança
            updateFilterState(); // Atualiza a interface
        };
    });
    // Slider de Raio (evento 'input' para atualização contínua enquanto arrasta)
    radiusSlider.oninput = () => {
        filtersChangedSinceLoad = true;
        updateFilterState();
    };

    // --- Ações dos Botões ---
    // Limpar Filtros
    if (btnClear) {
        btnClear.onclick = () => {
            // Reseta checkboxes (só 'Levantamentos' fica ativo)
            filterCheckboxes.forEach(cb => cb.checked = (cb.id === 'filter-service-levantamentos'));
            // Reseta slider
            radiusSlider.value = 1500;
            filtersChangedSinceLoad = false; // Reseta flag de mudança
            updateFilterState(); // Atualiza interface
            showFeedback('filter-apply-feedback', 'Filtros redefinidos para o padrão.', 'info', 2500);
        };
    }

    // Aplicar Filtros
    if (btnApply) {
        btnApply.onclick = () => {
            if (!filtersChangedSinceLoad) return; // Não faz nada se não houve mudanças

            setLoading(btnApply, true);
            showFeedback('filter-apply-feedback', 'Aplicando filtros ao mapa...', 'info', 1500);

            // Simula aplicação dos filtros (atraso de 1.2s)
            setTimeout(() => {
                setLoading(btnApply, false);
                showFeedback('filter-apply-feedback', 'Filtros aplicados com sucesso! (Simulação)', 'success', 3000);
                filtersChangedSinceLoad = false; // Reseta flag
                btnApply.disabled = true; // Desativa botão até nova mudança
                // Opcional: Fechar o modal após aplicar
                // closeModal(modal);

                // Lógica REAL: Aqui você pegaria os valores dos filtros
                // e os enviaria para a função que atualiza o mapa/lista de ATMs.
                // Ex: updateMapFilters(getSelectedFilters());
            }, 1200);
        };
    }

    // Salvar Combinação (Simulação)
    if (btnSave) {
         btnSave.onclick = () => {
             setLoading(btnSave, true);
             showFeedback('filter-apply-feedback', 'Salvando combinação de filtros...', 'info', 1000);
             setTimeout(() => {
                 setLoading(btnSave, false);
                 showFeedback('filter-apply-feedback', 'Combinação salva como "Meu Padrão"! (Simulado)', 'success', 3500);
                 // Lógica REAL: Guardaria os filtros selecionados no localStorage ou perfil do user.
             }, 1000);
         };
     }

    // --- Estado Inicial ao Abrir ---
    filtersChangedSinceLoad = false; // Reseta a flag sempre que o modal abre
    updateFilterState(); // Atualiza a interface para o estado atual (que pode ter sido guardado)
    console.log("-> Lógica do Modal Filtros concluída.");
}; // Fim de window.init_modal_filtros


/**
 * Inicializa a lógica INTERNA do Modal de Economia.
 * Chamada sempre que o #modal-economia é aberto.
 * @param {HTMLElement} modal - O elemento do modal (#modal-economia).
 */
window.init_modal_economia = (modal) => {
    console.log("-> Inicializando lógica do Modal Economia...");
    // Seleciona elementos INTERNOS
    const amountInput = modal.querySelector('#withdrawal-amount'); // Input do valor a levantar
    const feeSlider = modal.querySelector('#informal-fee-percent'); // Slider da taxa informal
    const feeValueSpan = modal.querySelector('#informal-fee-value'); // Span que mostra a % da taxa
    const informalCostSpan = modal.querySelector('#informal-total-cost'); // Custo total informal
    const informalFeeAmountSpan = modal.querySelector('#informal-fee-amount'); // Valor da taxa informal
    const officialCostSpan = modal.querySelector('#official-total-cost'); // Custo oficial (igual ao valor)
    const savingsSpan = modal.querySelector('#instant-savings'); // Poupança imediata
    const monthlySavingsSpan = modal.querySelector('#monthly-savings'); // Poupança mensal simulada
    const savingsProgressBarFill = modal.querySelector('#monthly-savings-progress .progress-fill'); // Barra de progresso
    const securityLink = modal.querySelector('.security-link'); // Link para o modal de segurança

    // Verifica elementos essenciais
    if (!amountInput || !feeSlider || !feeValueSpan || !informalCostSpan || !informalFeeAmountSpan || !officialCostSpan || !savingsSpan || !monthlySavingsSpan || !savingsProgressBarFill) {
        console.error("Modal Economia: Um ou mais elementos essenciais não encontrados. Verifique IDs e estrutura HTML.");
        return;
    }

    // --- Função para Atualizar a Simulação e a Interface ---
    const updateSimulation = () => {
        const amount = parseFloat(amountInput.value) || 0; // Valor do levantamento
        const feePercent = parseFloat(feeSlider.value) || 0; // Percentagem da taxa informal

        // Cálculos
        const informalFee = amount * (feePercent / 100); // Valor da taxa
        const informalTotal = amount + informalFee; // Custo total com taxa
        const savings = informalFee; // A poupança é igual à taxa evitada

        // Atualiza interface
        feeValueSpan.textContent = `${feePercent}%`;
        informalCostSpan.textContent = formatCurrency(informalTotal);
        informalFeeAmountSpan.textContent = formatCurrency(informalFee);
        officialCostSpan.textContent = formatCurrency(amount); // Custo oficial é só o valor
        savingsSpan.textContent = formatCurrency(savings);

        // Simulação de Poupança Mensal Acumulada (Lógica de Exemplo)
        // Assume que o utilizador faz N levantamentos por mês com poupança semelhante
        const simulatedMonthlyMultiplier = 2 + Math.random() * 6; // Entre 2 e 8 levantamentos/mês
        const simulatedMonthlySavings = Math.max(10000, savings * simulatedMonthlyMultiplier); // Mínimo de 10.000 Kz
        monthlySavingsSpan.textContent = formatCurrency(simulatedMonthlySavings);

        // Atualiza Barra de Progresso Mensal (Ex: Meta de 100.000 Kz)
        const monthlyGoal = 100000;
        const progressPercent = Math.min(100, (simulatedMonthlySavings / monthlyGoal) * 100);
        savingsProgressBarFill.style.width = `${progressPercent}%`;
        savingsProgressBarFill.setAttribute('aria-valuenow', progressPercent); // Acessibilidade

        // Atualiza visual do slider (cor de fundo)
        const min = feeSlider.min ? parseFloat(feeSlider.min) : 0;
        const max = feeSlider.max ? parseFloat(feeSlider.max) : 20; // Ex: max 20%
        const percent = ((feePercent - min) / (max - min)) * 100;
        // Muda a cor do track antes do thumb (verde -> amarelo -> vermelho)
        // Usa HSL: Hue 120 (verde) -> 60 (amarelo) -> 0 (vermelho)
        const hue = 120 - (percent * 1.2); // Ajusta o fator 1.2 conforme necessário
        feeSlider.style.setProperty('--track-color', `hsl(${hue}, 70%, 60%)`); // Variável CSS para o track
        feeSlider.style.setProperty('--value-percent', `${percent}%`); // Para o preenchimento
    };

    // --- Event Listeners ---
    // Input do valor (evento 'input' para atualizar ao digitar)
    amountInput.addEventListener('input', updateSimulation);
    // Slider da taxa (evento 'input' para atualizar ao arrastar)
    feeSlider.addEventListener('input', updateSimulation);

    // --- Link para Modal de Segurança (se existir) ---
    if (securityLink) {
        securityLink.onclick = (e) => {
            e.preventDefault(); // Previne comportamento padrão do link
            const targetModalId = securityLink.getAttribute('data-modal-target'); // Pega o ID do modal alvo

            if (targetModalId) {
                closeModal(modal); // Fecha o modal de economia atual
                // Abre o modal de segurança após um pequeno delay
                setTimeout(() => {
                    // Tenta abrir o modal alvo usando a função global openModal
                    const targetModalElement = document.getElementById(targetModalId.substring(1));
                    if (targetModalElement) {
                        openModal(targetModalId); // Reusa a função global
                    } else {
                        console.error(`Modal de Segurança (${targetModalId}) não encontrado ao tentar abrir a partir do Modal Economia.`);
                    }
                }, 350); // Delay para permitir animação de fecho
            } else {
                console.warn("Link de segurança não tem 'data-modal-target' definido.");
            }
        };
    }

    // --- Cálculo Inicial ao Abrir ---
    updateSimulation(); // Calcula e mostra os valores iniciais
    console.log("-> Lógica do Modal Economia concluída.");
}; // Fim de window.init_modal_economia


/**
 * Inicializa a lógica INTERNA do Modal de Colaboração e Gamificação.
 * Chamada sempre que o #modal-colaborativa é aberto.
 * @param {HTMLElement} modal - O elemento do modal (#modal-colaborativa).
 */
window.init_modal_colaborativa = (modal) => {
    console.log("-> Inicializando lógica do Modal Colaborativa...");
    // Seleciona elementos INTERNOS
    const reportButtons = modal.querySelectorAll('.report-button'); // Botões: Com dinheiro, Sem dinheiro, Outro
    const otherIssueSection = modal.querySelector('#other-issue-section'); // Secção para descrever outro problema
    const issueDescription = modal.querySelector('#issue-description'); // Textarea para descrição
    const btnSubmitIssue = modal.querySelector('#btn-submit-issue'); // Botão para submeter descrição
    const collabScoreEl = modal.querySelector('#collab-score'); // Span da pontuação
    const badgeIconEl = modal.querySelector('#collab-badge-icon i'); // O ícone <i> da medalha/badge
    const badgeNameEl = modal.querySelector('#collab-badge-name'); // Nome da badge (Bronze, Prata...)
    const badgeProgressBar = modal.querySelector('#badge-progress-bar .progress-fill'); // Barra de progresso para próxima badge
    const nextBadgeText = modal.querySelector('.next-badge-progress small'); // Texto abaixo da barra
    const activityList = modal.querySelector('#user-activity-list'); // Lista de atividades recentes
    const reportFeedback = modal.querySelector('#report-feedback-collab'); // Feedback específico deste modal

    // Verifica elementos essenciais
    if (!reportButtons || reportButtons.length === 0 || !otherIssueSection || !issueDescription || !btnSubmitIssue || !collabScoreEl || !badgeIconEl || !badgeNameEl || !badgeProgressBar || !nextBadgeText || !activityList || !reportFeedback) {
        console.error("Modal Colaborativa: Um ou mais elementos essenciais não encontrados. Verifique IDs e estrutura HTML.");
        return;
    }

    // --- Configuração da Gamificação ---
    let currentScore = parseInt(collabScoreEl.textContent) || 125; // Pega score do HTML ou usa 125 como padrão
    const badges = [
        // Pontos MÍNIMOS para atingir a badge
        { points: 0, name: "Iniciante", icon: "ri-seedling-line"},
        { points: 100, name: "Colaborador Bronze", icon: "ri-copper-coin-line"},
        { points: 250, name: "Colaborador Prata", icon: "ri-medal-line"},
        { points: 500, name: "Colaborador Ouro", icon: "ri-trophy-line"},
        { points: 1000, name: "Mestre ATM Platina", icon: "ri-vip-diamond-line"}
    ];

    // --- Função para Atualizar a Interface de Gamificação ---
    const updateGamification = () => {
        collabScoreEl.textContent = currentScore; // Atualiza pontuação

        // Encontra a badge atual e a próxima
        let currentBadge = badges[0];
        let nextBadge = badges[1];
        for (let i = badges.length - 1; i >= 0; i--) {
            if (currentScore >= badges[i].points) {
                currentBadge = badges[i];
                nextBadge = (i < badges.length - 1) ? badges[i+1] : null; // Próxima badge ou null se for a última
                break;
            }
        }

        // Atualiza ícone e nome da badge
        badgeIconEl.className = currentBadge.icon; // Define a classe do ícone
        badgeNameEl.textContent = currentBadge.name;

        // Atualiza barra de progresso e texto
        if (nextBadge) {
            // Calcula progresso para a próxima badge
            const pointsForCurrentLevel = currentBadge.points;
            const pointsForNextLevel = nextBadge.points;
            const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
            const progressInLevel = Math.max(0, currentScore - pointsForCurrentLevel);
            const percent = Math.min(100, (progressInLevel / pointsNeeded) * 100);

            badgeProgressBar.style.width = `${percent}%`;
            badgeProgressBar.setAttribute('aria-valuenow', percent);
            nextBadgeText.textContent = `${progressInLevel}/${pointsNeeded} pts para ${nextBadge.name}`;
            badgeProgressBar.setAttribute('aria-valuetext', `${percent.toFixed(0)}% para ${nextBadge.name}`);
        } else {
            // Nível máximo atingido
            badgeProgressBar.style.width = '100%';
            badgeProgressBar.setAttribute('aria-valuenow', 100);
            nextBadgeText.textContent = `Nível Máximo Atingido! Parabéns!`;
            badgeProgressBar.setAttribute('aria-valuetext', `Nível Máximo (${currentBadge.name})`);
        }
    };

    // --- Função para Adicionar Item à Lista de Atividades Recentes ---
     const addActivity = (iconClass, text, points) => {
         const newItem = document.createElement('li');
         // Usar flexbox no CSS da lista para alinhar a pontuação à direita
         newItem.innerHTML = `
            <span class="activity-icon-text"><i class="${iconClass}"></i> ${text}</span>
            <span class="activity-points">(+${points} pts)</span>
        `;
         activityList.prepend(newItem); // Adiciona no início
         // Limita o número de itens na lista (ex: 5)
         while (activityList.children.length > 5) {
             activityList.removeChild(activityList.lastChild);
         }
     };

    // --- Lógica dos Botões de Reporte Rápido ---
    reportButtons.forEach(button => {
        button.onclick = () => {
            const feedbackType = button.dataset.feedback; // 'success', 'error', 'issue'

            // Esconde a secção de 'Outro Problema' por defeito
            otherIssueSection.style.display = 'none';
            issueDescription.value = ''; // Limpa descrição anterior

            if (feedbackType === 'issue') {
                // Se clicou em "Outro Problema", mostra a secção e pede descrição
                otherIssueSection.style.display = 'flex'; // Ou 'block', dependendo do CSS
                issueDescription.focus(); // Coloca foco na textarea
                showFeedback('report-feedback-collab', 'Descreva o problema encontrado abaixo.', 'info', 4000);
                return; // Não faz mais nada neste caso, espera submissão da descrição
            }

            // Para 'success' (Com dinheiro) e 'error' (Sem dinheiro)
            setLoading(button, true); // Mostra loading SÓ no botão clicado
            // Opcional: Desativar outros botões enquanto processa
            reportButtons.forEach(btn => { if (btn !== button) btn.disabled = true; });

            showFeedback('report-feedback-collab', 'Registrando sua contribuição...', 'info', 1200);

            // Simula registo (atraso de 1.2s)
            setTimeout(() => {
                setLoading(button, false); // Remove loading
                reportButtons.forEach(btn => btn.disabled = false); // Reativa outros botões

                let points = 0;
                let text = '';
                let icon = '';

                if (feedbackType === 'success') {
                    points = 5; // Mais pontos por confirmar que funciona
                    text = 'Confirmou ATM "Com Dinheiro"';
                    icon = 'ri-thumb-up-line success-color';
                    showFeedback('report-feedback-collab', 'Obrigado! Reporte de ATM funcional registado.', 'success', 3000);
                } else if (feedbackType === 'error') {
                    points = 3; // Menos pontos por reportar problema (mas ainda útil)
                    text = 'Reportou ATM "Sem Dinheiro"';
                    icon = 'ri-thumb-down-line error-color';
                    showFeedback('report-feedback-collab', 'Obrigado! Reporte de ATM sem dinheiro registado.', 'success', 3000);
                }

                if (points > 0) {
                    currentScore += points; // Adiciona pontos
                    updateGamification(); // Atualiza display da pontuação/badge
                    addActivity(icon, text, points); // Adiciona à lista de atividades
                }
            }, 1200); // Fim do setTimeout
        }; // Fim do button.onclick
    });

    // --- Lógica do Botão Submeter Descrição de Problema ---
    if (btnSubmitIssue) {
         btnSubmitIssue.onclick = () => {
             const description = issueDescription.value.trim();
             if (!description) {
                 showFeedback('report-feedback-collab', 'Por favor, descreva o problema antes de submeter.', 'warning', 3000);
                 issueDescription.focus();
                 return;
             }

             setLoading(btnSubmitIssue, true);
             // Desativa outros botões de reporte enquanto submete
             reportButtons.forEach(btn => btn.disabled = true);
              showFeedback('report-feedback-collab', 'Enviando descrição do problema...', 'info', 1500);

              // Simula submissão (atraso de 1.2s)
              setTimeout(() => {
                   setLoading(btnSubmitIssue, false);
                   reportButtons.forEach(btn => btn.disabled = false); // Reativa botões

                   showFeedback('report-feedback-collab', 'Problema reportado com sucesso. Obrigado pela sua ajuda!', 'success', 3500);

                   const points = 8; // Mais pontos por dar detalhes
                   currentScore += points;
                   updateGamification();
                   // Adiciona atividade com parte da descrição
                   const shortDesc = description.substring(0, 30) + (description.length > 30 ? '...' : '');
                   addActivity('ri-alert-line warning-color', `Reportou "Outro Problema": ${shortDesc}`, points);

                   // Esconde a secção e limpa a textarea
                   otherIssueSection.style.display = 'none';
                   issueDescription.value = '';

              }, 1200); // Fim do setTimeout
         };
     }

    // --- Estado Inicial ao Abrir ---
    otherIssueSection.style.display = 'none'; // Garante que está escondido
    issueDescription.value = ''; // Limpa textarea
    updateGamification(); // Atualiza a gamificação com o score atual
     // Opcional: Carregar histórico de atividades aqui se não for persistido
     if(activityList.children.length === 0) {
        activityList.innerHTML = '<li class="placeholder">Nenhuma atividade recente.</li>';
     }

    console.log("-> Lógica do Modal Colaborativa concluída.");
}; // Fim de window.init_modal_colaborativa


/*=============== 12. SMOOTH SCROLLING PARA LINKS ÂNCORA (#) ===============*/
const initSmoothScroll = () => {
    // Seleciona todos os links que começam com '#' (links internos)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Verifica se é um link interno válido (não apenas '#')
            if (href && href.length > 1 && href.startsWith('#')) {
                try {
                    // Tenta encontrar o elemento alvo
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault(); // Previne o salto padrão do browser

                        // Calcula a posição de destino com offset para o header fixo
                        const headerHeight = document.getElementById('header')?.offsetHeight || 70;
                        const offset = headerHeight + 15; // Offset ligeiramente maior que a altura do header
                        const elementPosition = targetElement.getBoundingClientRect().top; // Posição relativa à viewport
                        const offsetPosition = elementPosition + window.pageYOffset - offset; // Posição absoluta ajustada

                        // Executa o scroll suave
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth" // Efeito de scroll suave
                        });

                        // Opcional: Fecha o menu mobile se estiver aberto após clicar num link
                        document.getElementById('nav-menu')?.classList.remove('show-menu');
                        document.getElementById('nav-toggle')?.setAttribute('aria-expanded', 'false');
                    }
                    // Se targetElement não for encontrado, o browser fará o comportamento padrão (ou nada se o ID não existir)
                } catch (err) {
                    // Erro comum se o href for algo como "#!" que não é um seletor CSS válido
                    console.error("Erro no smooth scroll ao tentar encontrar o alvo:", href, err);
                }
            }
        });
    });
    console.log("ATM na Mão: Smooth Scrolling para links âncora inicializado.");
};


/*=============== 13. FORM SUBMISSIONS (AJAX SIMULADO) ===============*/
// Função genérica para lidar com submissão de formulários (ex: Subscrição, Contacto)
const handleFormSubmit = (formId, feedbackId, successMessage, errorMessage) => {
    const form = document.getElementById(formId);
    if (!form) return; // Sai se o formulário não existir nesta página

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Previne o recarregamento da página

        const submitButton = form.querySelector('button[type="submit"]');
        if(submitButton) setLoading(submitButton, true); // Ativa loading no botão
        showFeedback(feedbackId, 'Enviando dados...', 'info', 5000); // Feedback inicial

        // Simula um pedido AJAX (atraso de 1.5s)
        setTimeout(() => {
            const randomSuccess = Math.random() > 0.15; // 85% de chance de sucesso (simulação)

            if(submitButton) setLoading(submitButton, false); // Desativa loading

            if (randomSuccess) {
                showFeedback(feedbackId, successMessage, 'success', 4000);
                form.reset(); // Limpa o formulário em caso de sucesso
            } else {
                showFeedback(feedbackId, errorMessage, 'error', 5000);
                // Não limpa o formulário em caso de erro, para o utilizador corrigir
            }
        }, 1500); // Fim do setTimeout
    });
    console.log(`ATM na Mão: Handler para submissão do formulário #${formId} inicializado.`);
};


/*=============== 14. UPDATE COPYRIGHT YEAR ===============*/
const initFooterYear = () => {
    const el = document.getElementById('current-year');
    if (el) {
        el.textContent = new Date().getFullYear(); // Define o ano atual
        // console.log("ATM na Mão: Ano do Copyright atualizado."); // Log talvez desnecessário
    }
};


/**
 * -------------------------------------------------------------------------
 * EXECUÇÃO PRINCIPAL APÓS O DOM CARREGAR
 * -------------------------------------------------------------------------
 * Chama as funções de inicialização necessárias, verificando antes se os
 * elementos principais para cada módulo existem na página atual.
 */
runWhenDOMLoaded(() => {
    console.log("%cATM na Mão: Iniciando Scripts Consolidados (God Tier)...", "color: #4CAF50; font-weight: bold;");

    // Inicializações Globais (devem funcionar em quase todas as páginas)
    initPreloader();
    initMobileMenu(); // Mesmo que não haja menu, a função interna verifica
    initHeaderScroll();
    initThemeSwitcher(); // Essencial para modo escuro/claro
    initScrollUp();
    initSmoothScroll();
    initFooterYear();

    // Inicializações Condicionais (só executam se encontrarem os elementos)
    if (document.getElementById('sidebar')) initSidebar();
    if (document.querySelector('section[id]')) initActiveLinkScroll(); // Precisa de secções com ID
    if (document.querySelector('.faq__item')) initAccordion('.faq__item', false); // FAQ: só um aberto
    if (document.querySelector('.tech-accordion__item')) initAccordion('.tech-accordion__item', true); // Tech: múltiplos abertos
    if (document.querySelector('[data-animation]')) {
        // Delay ligeiro para garantir layout estável antes de observar
         setTimeout(initScrollAnimations, 150);
    }
    if (typeof jQuery !== 'undefined' && typeof jQuery.fn.slick !== 'undefined') {
        // Só tenta inicializar sliders se jQuery e Slick estiverem presentes
        initSlickSliders();
    } else if (document.querySelector('.vantagens__image-slider') || document.querySelector('.dl-showcase-slider')) {
        // Avisa apenas se os elementos dos sliders existirem mas jQuery/Slick não
        console.warn("ATM na Mão: Elementos de Slider encontrados, mas jQuery/Slick não estão carregados. Sliders não funcionarão.");
    }
    if (document.querySelector('[data-modal-target]') || document.querySelector('.modal')) {
        initModals(); // Configura sistema de modais (abrir/fechar)
        // As lógicas internas de cada modal (`init_modal_...`) são chamadas DENTRO de `openModal`
    }
    if (document.getElementById('subscribe-form')) {
        handleFormSubmit(
            'subscribe-form',
            'subscribe-feedback',
            'Obrigado pela sua subscrição! Será notificado.',
            'Erro ao subscrever. Tente novamente mais tarde.'
        );
    }
    if (document.getElementById('contact-form')) {
        handleFormSubmit(
            'contact-form',
            'contact-feedback',
            'Mensagem enviada! Entraremos em contacto em breve.',
            'Falha no envio. Verifique a ligação ou tente mais tarde.'
        );
    }


    /*=============== FINAL MESSAGE ===============*/
    console.log("%cATM na Mão: Todos os scripts aplicáveis foram inicializados com sucesso!", "color: #4CAF50; font-weight: bold;");

}); // Fim de runWhenDOMLoaded
