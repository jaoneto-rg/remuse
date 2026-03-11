(function () {
  function initHeroSection(scope) {
    const mount = scope || document;
    const root = document.documentElement;
    const hero = mount.querySelector("#hero");
    const themeToggle = mount.querySelector("#themeToggle");
    const themeLabel = mount.querySelector("#themeLabel");
    const themeIcon = mount.querySelector("#themeIcon");
    const langToggle = mount.querySelector("#langToggle");
    const langLabel = mount.querySelector("#langLabel");
    const typedSubtitleTop = mount.querySelector("#typedSubtitleTop");
    const typedSubtitleBottom = mount.querySelector("#typedSubtitleBottom");
    const caretTop = mount.querySelector("#caretTop");
    const caretBottom = mount.querySelector("#caretBottom");
    const worldContainer = mount.querySelector(".world");
    const fragmentShaderScript = mount.querySelector("#fragmentShader");
    const vertexShaderScript = mount.querySelector("#vertexShader");

    if (!hero || !worldContainer || !fragmentShaderScript || !vertexShaderScript) {
      return;
    }

    const atmospheres = {
      light: [
        { speed: 0.14, hue: 0.0, hueVariation: 0.0, density: 0.58, displacement: 0.44, saturation: 0.92, lightness: 0.95, lightnessVariation: 0.02 },
        { speed: 0.16, hue: 0.0, hueVariation: 0.0, density: 0.62, displacement: 0.50, saturation: 0.96, lightness: 0.94, lightnessVariation: 0.03 },
        { speed: 0.18, hue: 0.0, hueVariation: 0.0, density: 0.66, displacement: 0.52, saturation: 0.99, lightness: 0.93, lightnessVariation: 0.04 }
      ],
      dark: [
        { speed: 0.14, hue: 0.0, hueVariation: 0.0, density: 0.58, displacement: 0.44, saturation: 0.92, lightness: 0.95, lightnessVariation: 0.02 },
        { speed: 0.16, hue: 0.0, hueVariation: 0.0, density: 0.62, displacement: 0.50, saturation: 0.96, lightness: 0.94, lightnessVariation: 0.03 },
        { speed: 0.18, hue: 0.0, hueVariation: 0.0, density: 0.66, displacement: 0.52, saturation: 0.99, lightness: 0.93, lightnessVariation: 0.04 }
      ]
    };

    class World {
      constructor(width, height) {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(width, height);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 20000);
        this.camera.position.z = 200;
        worldContainer.appendChild(this.renderer.domElement);

        this.timer = 0;
        this.mousePos = { x: 0.5, y: 0.5 };
        this.targetMousePos = { x: 0.5, y: 0.5 };
        this.parameters = atmospheres.light[0];
        this.createPlane();
      }

      createPlane() {
        this.material = new THREE.RawShaderMaterial({
          vertexShader: vertexShaderScript.textContent,
          fragmentShader: fragmentShaderScript.textContent,
          uniforms: {
            uTime: { value: 0 },
            uHue: { value: 0.0 },
            uHueVariation: { value: 0.0 },
            uDensity: { value: 0.58 },
            uDisplacement: { value: 0.44 },
            uSaturation: { value: 0.92 },
            uLightness: { value: 0.95 },
            uLightnessVariation: { value: 0.02 },
            uMousePosition: { value: new THREE.Vector2(0.5, 0.5) }
          }
        });

        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 1, 1), this.material);
        this.scene.add(this.plane);
      }

      applyParameters(next) {
        this.parameters = next;
        const u = this.plane.material.uniforms;
        u.uHue.value = next.hue;
        u.uHueVariation.value = next.hueVariation;
        u.uDensity.value = next.density;
        u.uDisplacement.value = next.displacement;
        u.uSaturation.value = next.saturation;
        u.uLightness.value = next.lightness;
        u.uLightnessVariation.value = next.lightnessVariation;
      }

      render() {
        this.timer += this.parameters.speed;
        this.plane.material.uniforms.uTime.value = this.timer;

        this.mousePos.x += (this.targetMousePos.x - this.mousePos.x) * 0.1;
        this.mousePos.y += (this.targetMousePos.y - this.mousePos.y) * 0.1;
        this.plane.material.uniforms.uMousePosition.value = new THREE.Vector2(this.mousePos.x, this.mousePos.y);
        this.renderer.render(this.scene, this.camera);
      }

      loop() {
        this.render();
        requestAnimationFrame(this.loop.bind(this));
      }

      updateSize(w, h) {
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      }

      mouseMove(mousePos) {
        this.targetMousePos.x = mousePos.px;
        this.targetMousePos.y = mousePos.py;
      }
    }

    let world;
    let moodIndex = 0;

    function currentTheme() {
      return root.dataset.theme === "dark" ? "dark" : "light";
    }

    function setTheme(next) {
      root.dataset.theme = next;
      localStorage.setItem("theme", next);
      if (themeLabel) {
        themeLabel.textContent = next === "dark" ? "Dark" : "Light";
      }
      if (themeIcon) {
        themeIcon.textContent = next === "dark" ? "☾" : "☀";
      }
      moodIndex = 0;
      if (world) world.applyParameters(atmospheres[next][moodIndex]);
    }

    const i18n = {
      pt: {
        "nav.home": "Inicio",
        "nav.summary": "Resumo",
        "nav.journey": "Trajetoria",
        "nav.education": "Formacao",
        "nav.projects": "Projetos",
        "nav.contact": "Contato",
        "hero.subtitle.top": "I'm Frontend Developer",
        "hero.subtitle.bottom": "& Designer UI/UX",
        "resume.eyebrow": "Resumo Profissional",
        "resume.title": "Resumo Profissional",
        "resume.body": "Desenvolvedor Front-end Pleno e UI/UX Designer com experiencia no desenvolvimento de aplicacoes web e mobile, atuando desde a concepcao da interface ate a implementacao tecnica. Forte atuacao com React.js, Vue.js, TypeScript e React Native, com foco em arquitetura baseada em componentes, performance e acessibilidade. Vivencia em ambientes ageis, integracao com APIs RESTful e colaboracao com times multidisciplinares para entrega de solucoes centradas no usuario.",
        "journey.eyebrow": "Trajetoria",
        "journey.title": "Experiencia Profissional",
        "journey.agill.title": "Agill — Desenvolvedor Front-end",
        "journey.agill.meta": "Ago/2024 - Nov/2025 · Presencial · Maceio/AL",
        "journey.agill.body": "Desenvolvimento, evolucao e manutencao de interfaces web com Vue.js, JavaScript e TypeScript. Decisoes tecnicas de arquitetura de componentes, modernizacao de sistemas internos, melhoria de performance e UX. Integracao com APIs RESTful e trabalho em ambiente agil (Scrum) com designers e back-end.",
        "journey.daily.title": "Daily Grind — Mobile Full Stack Project (Projeto Proprio)",
        "journey.daily.meta": "Dez/2025 - Jan/2026 · Remoto · Maceio/AL",
        "journey.daily.body": "Idealizacao e desenvolvimento de app mobile de produtividade com React Native. Definicao de arquitetura, criacao de interfaces e funcionalidades. Prototipacao no Figma, principios de UX/UI, integracao com servicos back-end e versionamento com Git.",
        "journey.freelance.title": "Freelancer — Desenvolvedor Front-end",
        "journey.freelance.meta": "Abr/2023 - Jun/2023 · Remoto · Maceio/AL",
        "journey.freelance.body": "Interfaces responsivas com HTML5, CSS3 e JavaScript. Definicao visual e organizacao de layouts. Integracao com Laravel via APIs RESTful e boas praticas de acessibilidade e compatibilidade cross-browser.",
        "journey.defesa.title": "Defesa Civil de Maceio — Desenvolvedor Full-stack",
        "journey.defesa.meta": "Mar/2021 - Nov/2021 · Presencial · Maceio/AL",
        "journey.defesa.body": "Desenvolvimento e manutencao de sistemas internos com Laravel, atuando no front-end e em ajustes de usabilidade e layout. Correcao de funcionalidades e melhoria da experiencia dos usuarios internos.",
        "education.eyebrow": "Formacao",
        "education.title": "Formacao Academica e Certificados",
        "education.degree": "Bacharelado em Sistemas da Informacao — CESMAC",
        "education.degree.meta": "Conclusao: 2024 · Maceio/AL",
        "education.degree.body": "Formacao focada em desenvolvimento de software, bancos de dados, engenharia de requisitos e gestao de projetos.",
        "education.languages.title": "Idiomas",
        "education.languages.pt": "Portugues (Nativo)",
        "education.languages.en": "English — Intermediate (Technical Reading and Documentation)",
        "education.languages.es": "Espanhol (Tecnico)",
        "education.certs.title": "Certificados",
        "education.certs.front": "Formacao Front-end — Udemy — 2024",
        "education.certs.vue": "Desenvolvimento Web Avancado com Vue.js — Udemy — 2024",
        "education.certs.laravel": "Laravel 5.8 — Udemy — 2024",
        "education.certs.uiux": "UI/UX Designer com Figma — Udemy — 2024",
        "education.certs.rn": "React Native — Udemy — 2024",
        "projects.eyebrow": "Projetos",
        "projects.title": "Portfolio em Progresso",
        "projects.body": "Estou preparando meus projetos para publicacao. Enquanto isso, este espaco destaca as tecnologias que utilizo com mais frequencia.",
        "contact.eyebrow": "Contato",
        "contact.title": "Vamos Conversar",
        "contact.location.title": "Localizacao",
        "contact.location.body": "Maceio / AL",
        "contact.phone.title": "Telefone",
        "contact.links.title": "Links"
      },
      en: {
        "nav.home": "Home",
        "nav.summary": "Summary",
        "nav.journey": "Journey",
        "nav.education": "Education",
        "nav.projects": "Projects",
        "nav.contact": "Contact",
        "hero.subtitle.top": "I'm Frontend Developer",
        "hero.subtitle.bottom": "& UI/UX Designer",
        "resume.eyebrow": "Professional Summary",
        "resume.title": "Professional Summary",
        "resume.body": "Mid-level Front-end Developer and UI/UX Designer with experience building web and mobile applications, from interface conception to technical implementation. Strong work with React.js, Vue.js, TypeScript, and React Native, focusing on component-based architecture, performance, and accessibility. Experience in agile environments, RESTful API integration, and collaboration with multidisciplinary teams to deliver user-centered solutions.",
        "journey.eyebrow": "Journey",
        "journey.title": "Professional Experience",
        "journey.agill.title": "Agill — Front-end Developer",
        "journey.agill.meta": "Aug/2024 - Nov/2025 · On-site · Maceio/AL",
        "journey.agill.body": "Development, evolution, and maintenance of web interfaces using Vue.js, JavaScript, and TypeScript. Technical decisions on component architecture, modernization of internal systems, performance improvements, and UX enhancements. RESTful API integration and agile Scrum collaboration with designers and back-end.",
        "journey.daily.title": "Daily Grind — Mobile Full Stack Project (Personal Project)",
        "journey.daily.meta": "Dec/2025 - Jan/2026 · Remote · Maceio/AL",
        "journey.daily.body": "Designed and built a productivity mobile app with React Native. Defined architecture, created interfaces, and implemented features. Prototyped in Figma with UX/UI principles, integrated back-end services, and versioned with Git for scalability and visual consistency.",
        "journey.freelance.title": "Freelancer — Front-end Developer",
        "journey.freelance.meta": "Apr/2023 - Jun/2023 · Remote · Maceio/AL",
        "journey.freelance.body": "Responsive interfaces using HTML5, CSS3, and JavaScript. Visual definition and layout organization. Laravel integration via RESTful APIs and best practices for accessibility and cross-browser compatibility.",
        "journey.defesa.title": "Civil Defense of Maceio — Full-stack Developer",
        "journey.defesa.meta": "Mar/2021 - Nov/2021 · On-site · Maceio/AL",
        "journey.defesa.body": "Development and maintenance of internal systems with Laravel, working on front-end and usability/layout adjustments. Bug fixes and user experience improvements for internal teams.",
        "education.eyebrow": "Education",
        "education.title": "Education and Certificates",
        "education.degree": "B.Sc. in Information Systems — CESMAC",
        "education.degree.meta": "Graduated: 2024 · Maceio/AL",
        "education.degree.body": "Program focused on software development, databases, requirements engineering, and project management.",
        "education.languages.title": "Languages",
        "education.languages.pt": "Portuguese (Native)",
        "education.languages.en": "English — Intermediate (Technical Reading and Documentation)",
        "education.languages.es": "Spanish (Technical)",
        "education.certs.title": "Certificates",
        "education.certs.front": "Front-end Training — Udemy — 2024",
        "education.certs.vue": "Advanced Web Development with Vue.js — Udemy — 2024",
        "education.certs.laravel": "Laravel 5.8 — Udemy — 2024",
        "education.certs.uiux": "UI/UX Designer with Figma — Udemy — 2024",
        "education.certs.rn": "React Native — Udemy — 2024",
        "projects.eyebrow": "Projects",
        "projects.title": "Portfolio In Progress",
        "projects.body": "I'm preparing my projects for publication. For now, this section highlights the technologies I use most often.",
        "contact.eyebrow": "Contact",
        "contact.title": "Let's Talk",
        "contact.location.title": "Location",
        "contact.location.body": "Maceio / AL",
        "contact.phone.title": "Phone",
        "contact.links.title": "Links"
      }
    };

    function applyI18n(lang) {
      const dict = i18n[lang] || i18n.pt;
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key || !dict[key]) return;
        el.textContent = dict[key];
      });

      if (typedSubtitleTop) typedSubtitleTop.dataset.text = dict["hero.subtitle.top"];
      if (typedSubtitleBottom) typedSubtitleBottom.dataset.text = dict["hero.subtitle.bottom"];
    }

    function setLang(next) {
      root.dataset.lang = next;
      localStorage.setItem("lang", next);
      document.documentElement.lang = next === "en" ? "en" : "pt-BR";
      if (langLabel) {
        langLabel.textContent = next === "en" ? "EN" : "PT";
      }
      applyI18n(next);
      startTypingAnimation();
    }

    function initTheme() {
      const saved = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(saved || (systemPrefersDark ? "dark" : "light"));
    }

    function getHeroMouse(event) {
      const rect = hero.getBoundingClientRect();
      const x = event.clientX ?? event.touches[0].clientX;
      const y = event.clientY ?? event.touches[0].clientY;
      const px = (x - rect.left) / rect.width;
      const py = 1.0 - (y - rect.top) / rect.height;
      return {
        px: Math.max(0, Math.min(1, px)),
        py: Math.max(0, Math.min(1, py))
      };
    }

    function initWorld() {
      const rect = hero.getBoundingClientRect();
      world = new World(rect.width, rect.height);
      world.applyParameters(atmospheres[currentTheme()][moodIndex]);
      world.loop();
    }

    window.addEventListener("resize", function () {
      if (!world) return;
      const rect = hero.getBoundingClientRect();
      world.updateSize(rect.width, rect.height);
    });

    hero.addEventListener("mousemove", function (event) {
      if (!world) return;
      world.mouseMove(getHeroMouse(event));
    });

    hero.addEventListener("touchmove", function (event) {
      if (!world || !event.touches[0]) return;
      world.mouseMove(getHeroMouse(event));
    }, { passive: true });

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        const next = currentTheme() === "dark" ? "light" : "dark";
        setTheme(next);
      });
    }

    if (langToggle) {
      langToggle.addEventListener("click", function () {
        const next = (root.dataset.lang || "pt") === "pt" ? "en" : "pt";
        setLang(next);
      });
    }

    let typingTimeout;

    function startTypingAnimation() {
      if (!typedSubtitleTop || !typedSubtitleBottom) return;

      const textTop = typedSubtitleTop.dataset.text || "";
      const textBottom = typedSubtitleBottom.dataset.text || "";
      const typingSpeed = 54;
      const deletingSpeed = 28;
      const holdAfterBothTyped = 1300;
      const holdAfterAllDeleted = 320;

      let topIndex = 0;
      let bottomIndex = 0;
      let phase = "typingTop";

      function setActiveCaret(active) {
        if (caretTop) caretTop.classList.toggle("active", active === "top");
        if (caretBottom) caretBottom.classList.toggle("active", active === "bottom");
      }

      function tick() {
        typedSubtitleTop.textContent = textTop.slice(0, topIndex);
        typedSubtitleBottom.textContent = textBottom.slice(0, bottomIndex);

        if (phase === "typingTop") {
          setActiveCaret("top");
          if (topIndex < textTop.length) {
            topIndex += 1;
            typingTimeout = setTimeout(tick, typingSpeed);
          } else {
            phase = "typingBottom";
            typingTimeout = setTimeout(tick, typingSpeed + 50);
          }
          return;
        }

        if (phase === "typingBottom") {
          setActiveCaret("bottom");
          if (bottomIndex < textBottom.length) {
            bottomIndex += 1;
            typingTimeout = setTimeout(tick, typingSpeed);
          } else {
            phase = "deletingBottom";
            typingTimeout = setTimeout(tick, holdAfterBothTyped);
          }
          return;
        }

        if (phase === "deletingBottom") {
          setActiveCaret("bottom");
          if (bottomIndex > 0) {
            bottomIndex -= 1;
            typingTimeout = setTimeout(tick, deletingSpeed);
          } else {
            phase = "deletingTop";
            typingTimeout = setTimeout(tick, deletingSpeed + 40);
          }
          return;
        }

        setActiveCaret("top");
        if (topIndex > 0) {
          topIndex -= 1;
          typingTimeout = setTimeout(tick, deletingSpeed);
        } else {
          phase = "typingTop";
          typingTimeout = setTimeout(tick, holdAfterAllDeleted);
        }
      }

      if (typingTimeout) clearTimeout(typingTimeout);
      typedSubtitleTop.textContent = "";
      typedSubtitleBottom.textContent = "";
      tick();
    }

    initTheme();
    setLang(localStorage.getItem("lang") || "pt");
    initWorld();
    startTypingAnimation();
  }

  window.initHeroSection = initHeroSection;
})();
