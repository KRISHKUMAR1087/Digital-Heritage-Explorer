/**
 * Heritage Quiz & Passport Badges Module (js/quiz.js)
 * Multilingual 5-question quiz per monument with instant explanations and passport badge rewards.
 */

const QuizComponent = (() => {
  const STORAGE_KEY = 'heritage_quiz_scores';

  // Sample Quiz Question Bank per Monument ID (Multilingual: en, gu, hi)
  const QUIZ_BANK = {
    'rani-ki-vav': [
      {
        q: { en: 'In which century was Rani ki Vav built?', gu: 'રાણી કી વાવ કઈ સદીમાં બંધાઈ હતી?', hi: 'रानी की वाव किस शताब्दी में बनाई गई थी?' },
        options: { en: ['11th Century', '14th Century', '16th Century', '9th Century'], gu: ['૧૧મી સદી', '૧૪મી સદી', '૧૬મી સદી', '૯મી સદી'], hi: ['11वीं शताब्दी', '14वीं शताब्दी', '16वीं शताब्दी', '9वीं शताब्दी'] },
        answer: 0,
        explanation: { en: 'Rani ki Vav was constructed in the 11th century AD by Queen Udayamati in memory of King Bhimdev I.', gu: 'રાણી કી વાવ ૧૧મી સદીમાં રાણી ઉદયમતી દ્વારા રાજા ભીમદેવ પ્રથમની યાદમાં બનાવવામાં આવી હતી.', hi: 'रानी की वाव का निर्माण 11वीं शताब्दी में रानी उदयामती द्वारा राजा भीमदेव प्रथम की याद में करवाया गया था।' }
      },
      {
        q: { en: 'How many subterranean levels does Rani ki Vav feature?', gu: 'રાણી કી વાવમાં કેટલા સ્તર (માળ) છે?', hi: 'रानी की वाव में कितने स्तर (मंजिलें) हैं?' },
        options: { en: ['3 levels', '5 levels', '7 levels', '9 levels'], gu: ['૩ સ્તર', '૫ સ્તર', '૭ સ્તર', '૯ સ્તર'], hi: ['3 स्तर', '5 स्तर', '7 स्तर', '9 स्तर'] },
        answer: 2,
        explanation: { en: 'Rani ki Vav is built in the Maru-Gurjara style with 7 terraced storeys and over 500 major sculptures.', gu: 'રાણી કી વાવ ૭ માળ ધરાવે છે અને તેમાં ૫૦૦ થી વધુ મુખ્ય શિલ્પો છે.', hi: 'रानी की वाव में 7 सीढ़ीदार मंजिलें हैं और 500 से अधिक मुख्य मूर्तियां हैं।' }
      },
      {
        q: { en: 'Which river bank is Rani ki Vav situated on?', gu: 'રાણી કી વાવ કઈ નદીના કિનારે આવેલી છે?', hi: 'रानी की वाव किस नदी के तट पर स्थित है?' },
        options: { en: ['Narmada', 'Saraswati', 'Sabarmati', 'Tapti'], gu: ['નર્મદા', 'સરસ્વતી', 'સાબરમતી', 'તાપી'], hi: ['नर्मदा', 'सरस्वती', 'साबरमती', 'ताप्ती'] },
        answer: 1,
        explanation: { en: 'It is situated on the banks of the Saraswati River in Patan, Gujarat.', gu: 'તે પાટણમાં સરસ્વતી નદીના કિનારે આવેલી છે.', hi: 'यह गुजरात के पाटन में सरस्वती नदी के तट पर स्थित है।' }
      },
      {
        q: { en: 'Which Indian Rupee currency note displays Rani ki Vav?', gu: 'કઈ ભારતીય ચલણી નોટ પર રાણી કી વાવનું ચિત્ર છે?', hi: 'किस भारतीय मुद्रा नोट पर रानी की वाव दर्शाई गई है?' },
        options: { en: ['₹50', '₹100', '₹200', '₹500'], gu: ['₹૫૦', '₹૧૦૦', '₹૨૦૦', '₹૫૦૦'], hi: ['₹50', '₹100', '₹200', '₹500'] },
        answer: 1,
        explanation: { en: 'The lavender ₹100 note issued by the Reserve Bank of India features Rani ki Vav.', gu: 'RBI ની ₹૧૦૦ ની નોટ પર રાણી કી વાવ દર્શાવવામાં આવી છે.', hi: 'आरबीआई द्वारा जारी ₹100 के नोट पर रानी की वाव अंकित है।' }
      },
      {
        q: { en: 'In which year was Rani ki Vav declared a UNESCO World Heritage Site?', gu: 'રાણી કી વાવને કયા વર્ષમાં યુનેસ્કો વર્લ્ડ હેરીટેજ સાઈટ જાહેર કરવામાં આવી?', hi: 'रानी की वाव को किस वर्ष यूनेस्को विश्व धरोहर स्थल घोषित किया गया था?' },
        options: { en: ['2010', '2014', '2018', '2020'], gu: ['૨૦૧૦', '૨૦૧૪', '૨૦૧૮', '૨૦૨૦'], hi: ['2010', '2014', '2018', '2020'] },
        answer: 1,
        explanation: { en: 'Rani ki Vav was recognized as a UNESCO World Heritage Site in 2014.', gu: '૨૦૧૪માં રાણી કી વાવને યુનેસ્કો દ્વારા વર્લ્ડ હેરિટેજ સાઇટ જાહેર કરાઈ.', hi: '2014 में रानी की वाव को यूनेस्को विश्व धरोहर घोषित किया गया था।' }
      }
    ]
  };

  // Default fallback questions for any site
  const GENERIC_QUESTIONS = [
    {
      q: { en: 'What is the architectural style of Gujarat heritage monuments?', gu: 'ગુજરાતના સ્થાપત્યની શૈલી કઈ છે?', hi: 'गुजरात के स्थापत्य की शैली कौन सी है?' },
      options: { en: ['Maru-Gurjara Style', 'Dravidian Style', 'Gothic Style', 'Pagoda Style'], gu: ['મારુ-ગુર્જર શૈલી', 'દ્રવિડ શૈલી', 'ગોથિક શૈલી', 'પેગોડા શૈલી'], hi: ['मारू-गुर्जर शैली', 'द्रविड़ शैली', 'गोथिक शैली', 'पैगोडा शैली'] },
      answer: 0,
      explanation: { en: 'Gujarat regional architecture is renowned for the intricate Solanki Maru-Gurjara style.', gu: 'ગુજરાતી સોલંકી સ્થાપત્ય મારુ-ગુર્જર શૈલી માટે જાણીતું છે.', hi: 'गुजरात वास्तुकला मारू-गुर्जर शैली के लिए जानी जाती है।' }
    },
    {
      q: { en: 'Why were traditional stepwells (vavs) built in Gujarat?', gu: 'ગુજરાતમાં વાવનું નિર્માણ શા માટે કરવામાં આવતું હતું?', hi: 'गुजरात में पारंपरिक बावड़ियों का निर्माण क्यों किया जाता था?' },
      options: { en: ['Water storage & community gather', 'Military fortresses', 'Granaries', 'Astronomical observatories'], gu: ['જળ સંચય અને સામાજિક સભા', 'લશ્કરી કિલ્લા', 'અનાજ સંગ્રહ', 'ખગોળીય વેધશાળા'], hi: ['जल संचयन और सामुदायिक सभा', 'सैन्य किले', 'अनाज भंडार', 'खगोलीय वेधशाला'] },
      answer: 0,
      explanation: { en: 'Stepwells served as subterranean water reservoirs, cool retreats, and sacred community gather places.', gu: 'વાવ એ જળસંચય અને શીતળ આશ્રયસ્થાન તરીકે ઉપયોગી હતી.', hi: 'बावड़ियां जल संचयन और ठंडे आश्रय स्थल के रूप में काम करती थीं।' }
    }
  ];

  /**
   * Safe localStorage score reader
   */
  function getCompletedQuizzes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('[Quiz] localStorage read error:', e);
      return {};
    }
  }

  /**
   * Safe localStorage score writer
   */
  function saveQuizScore(siteId, score, maxScore) {
    try {
      const current = getCompletedQuizzes();
      current[siteId] = { score, maxScore, date: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('[Quiz] localStorage write error:', e);
    }
  }

  /**
   * Render Quiz UI inside site detail modal container
   * @param {Object} site 
   * @param {HTMLElement} container 
   */
  function render(site, container) {
    if (!container || !site) return;

    container.style.display = 'block';
    const lang = (window.I18nComponent && I18nComponent.getCurrentLang()) || 'en';
    const questions = QUIZ_BANK[site.id] || GENERIC_QUESTIONS;
    const scores = getCompletedQuizzes();
    const existingScore = scores[site.id];

    container.innerHTML = `
      <div class="quiz-card-section">
        <h3 class="section-subtitle">🎯 Heritage Quiz &amp; Scholar Badge</h3>
        <p class="quiz-intro">Test your historical knowledge of ${escapeHTML(site.name)} to earn a Scholar Stamp!</p>
        
        ${existingScore ? `
          <div class="quiz-score-banner">
            🏆 Previous Score: <strong>${existingScore.score} / ${existingScore.maxScore}</strong>
            <button type="button" class="btn-retake-quiz" id="btn-retake-quiz">🔄 Retake Quiz</button>
          </div>
        ` : ''}

        <div class="quiz-questions-wrapper" id="quiz-questions-wrapper" ${existingScore ? 'style="display:none;"' : ''}>
          ${questions.map((qObj, idx) => `
            <div class="quiz-question-block" data-q-index="${idx}">
              <p class="quiz-q-text"><strong>Q${idx + 1}:</strong> ${escapeHTML(qObj.q[lang] || qObj.q.en)}</p>
              <div class="quiz-options-group">
                ${(qObj.options[lang] || qObj.options.en).map((opt, optIdx) => `
                  <button type="button" class="quiz-option-btn" data-opt-index="${optIdx}">
                    ${escapeHTML(opt)}
                  </button>
                `).join('')}
              </div>
              <div class="quiz-explanation" style="display:none;"></div>
            </div>
          `).join('')}

          <button type="button" id="btn-submit-quiz" class="btn-primary-action" style="margin-top: 1rem;">
            📝 Submit Answers
          </button>
        </div>
      </div>
    `;

    bindQuizEvents(site, container, questions, lang);
  }

  /**
   * Bind option selections and submit logic
   */
  function bindQuizEvents(site, container, questions, lang) {
    const userAnswers = {};

    container.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const block = btn.closest('.quiz-question-block');
        const qIdx = parseInt(block.dataset.qIndex, 10);
        const optIdx = parseInt(btn.dataset.optIndex, 10);

        block.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        userAnswers[qIdx] = optIdx;
      });
    });

    const btnSubmit = container.querySelector('#btn-submit-quiz');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        let score = 0;
        questions.forEach((qObj, idx) => {
          const block = container.querySelector(`.quiz-question-block[data-q-index="${idx}"]`);
          const expEl = block.querySelector('.quiz-explanation');
          const isCorrect = userAnswers[idx] === qObj.answer;

          if (isCorrect) score++;

          expEl.style.display = 'block';
          expEl.className = `quiz-explanation ${isCorrect ? 'correct' : 'incorrect'}`;
          expEl.innerHTML = `
            ${isCorrect ? '✅ Correct!' : '❌ Incorrect.'} ${qObj.explanation[lang] || qObj.explanation.en}
          `;
        });

        saveQuizScore(site.id, score, questions.length);
        btnSubmit.disabled = true;

        if (score === questions.length && window.PassportComponent) {
          PassportComponent.toggleVisited(site.id);
        }
      });
    }

    const btnRetake = container.querySelector('#btn-retake-quiz');
    if (btnRetake) {
      btnRetake.addEventListener('click', () => {
        const wrapper = container.querySelector('#quiz-questions-wrapper');
        if (wrapper) wrapper.style.display = 'block';
      });
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  return {
    render,
    getCompletedQuizzes
  };
})();
