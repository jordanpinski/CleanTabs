/**
 * Plugin entry point.
 */
class CleanTabs {
  constructor(cleanTabs = [], options) {
    this.cleanTabs = cleanTabs;
    if (this.cleanTabs.length <= 0) return;

    const defaultOptions = {
      _name: 'CleanTabs',
      _version: '1.0.1',
      openFirst: null,
      beforeOpen: (tab) => {},
      afterOpen: (tab) => {},
      beforeClose: (tab) => {},
      afterClose: (tab) => {}  
    }

    this.options = { ...defaultOptions, ...options };
    this.init();
  }

  init() {
    this.addGuids();
    this.buildMobile();
    this.bindEvents();
    this.openFirst();
  }

  openFirst(guid = 0) {
    this.cleanTabs.forEach( (cleanTab) => {

      // 1. Check if openFirst option was passed.
      if (this.options.openFirst) guid = this.options.openFirst;

      let dataOptions = this.getDataOptions(cleanTab);
      if (dataOptions) {
        let tabCount = cleanTab.querySelectorAll('[data-button]').length - 1;
        if ('openFirst' in dataOptions) guid = dataOptions.openFirst <= tabCount ? dataOptions.openFirst : guid;
      }

      // 2. Open the tab
      let tab = {
        button: cleanTab.querySelector(`[data-button][data-guid="${guid}"]`),
        content: cleanTab.querySelector(`[data-content][data-guid="${guid}"]`),
        guid: guid,
      }

      this.open(tab);
    });
  }

  bindEvents() {
    this.cleanTabs.forEach( (cleanTab) => {
      cleanTab.addEventListener('click', (event) => { this.handleTabClick(event); })
    });
  }

  handleTabClick(event) {
    event.preventDefault();
    if(!event.target.closest('[data-button]')) return;

    let button = event.target.closest('[data-button]');
    let anchor = button.querySelector('a');
    let hash = anchor.hash !== '' ? anchor.hash : false;
    let guid = button.dataset.guid;
    let content;

    if (hash) {

      // Target is defined in the anchor's hash
      content = document.querySelector(hash);
    } else {

      // If target isn't defined in anchor's hash use the buttons guid.
      content = document.querySelector(`[data-tab-group] [data-content][data-guid="${guid}"]`);
    }

    let tab = {
      button: button,
      content: content,
      guid: guid
    }

    this.open(tab);
  }

  // TODO: Refactor this. Should use index or id to open. Building a tab object is too much work.
  open(tab) {
    let { button, content, guid } = tab;
    
    // 1. Before open callback
    this.options.beforeOpen();

    // 2. Close all open tabs
    this.closeAll(tab);
    
    // 3. Open mobile
    if (guid >= 0) {
      let guid = button.closest('[data-tab-group]').dataset.guid;
      let accordionGroup = document.querySelector(`[data-accordion-group][data-guid="${guid}"]`);
      let accordion = accordionGroup.querySelector(`[data-accordion][data-guid="${tab.guid}"]`);
  
      window.cleanAccordion.open(accordion);
    }

    // 3. Open
    button.classList.add('open');
    content.classList.add('open');

    // 4. After open callback
    this.options.afterOpen();
  }

  close(tab) {
    let { button, content } = tab;

    // 1. Before close callback
    this.options.beforeClose();

    button.classList.remove('open');
    content.classList.remove('open');

    // 2. After close callback
    this.options.afterClose();
  }

  closeAll(tab) {
    let tabGroup = tab.button.closest('[data-tab-group');
    let buttons = tabGroup.querySelectorAll('[data-button]');
    let content = tabGroup.querySelectorAll('[data-content]');

    for (var i = 0; i < buttons.length; i++) {
      let tab = {
        button: buttons[i],
        content: content[i]
      }
      this.close(tab);
    }
  }

  /**
   * Builds the mobile accordion
   */
  buildMobile() {

    this.cleanTabs.forEach( (cleanTab) => {
      let guid = cleanTab.dataset.guid;
      let buttons = cleanTab.querySelectorAll('[data-button] a');
      let content = cleanTab.querySelectorAll('[data-content]');

      // 1. Create the accordion group
      let accordionGroup = document.createElement('div');
      accordionGroup.dataset.accordionTabGroup = '';
      accordionGroup.dataset.accordionGroup = '';
      accordionGroup.dataset.guid = guid;

      for (var i = 0; i < buttons.length; i++) {

        let button = buttons[i];
        let tempContent = content[i];

        // 2. Create an accordion for each tab
        let accordion = document.createElement('div');
        accordion.dataset.accordion = "";
        accordion.dataset.guid = [i];

        // Create the accordion title
        let accordionTitle = document.createElement('div');
        accordionTitle.dataset.control = "";
        accordionTitle.innerText = button.innerText;
  
        // Create the accordion content
        let accordionContent = document.createElement('div');
        accordionContent.dataset.content = "";
        accordionContent.innerHTML = tempContent.innerHTML;
        
        accordion.appendChild(accordionTitle)
        accordion.appendChild(accordionContent);
        accordionGroup.appendChild(accordion);
      }

      cleanTab.parentNode.insertBefore(accordionGroup, cleanTab.nextSibling);
      this.initializeCleanAccordion(cleanTab, [accordionGroup]);
    });

  }

  initializeCleanAccordion(cleanTab, accordionGroup) {
    let cleanAccordion = new CleanAccordion(accordionGroup, {
      afterOpen: (accordion) => {

        // 1. Find the corresponding tab group
        let accordionGroup = accordion.closest('[data-accordion-group]');
        let tabGroup = document.querySelector(`[data-tab-group][data-guid="${accordionGroup.dataset.guid}"]`);

        // 2. Find the corresponding tab by guid.
        let guid = parseInt(accordion.dataset.guid);
        let button = tabGroup.querySelector(`[data-button][data-guid="${guid}"]`);
        let content = tabGroup.querySelector(`[data-content][data-guid="${guid}"]`);

        this.open({button, content});
        
      }
    });

    window.cleanAccordion = cleanAccordion;
  }

  addGuids() {
    this.cleanTabs.forEach( (cleanTab, index) => {
      cleanTab.dataset.guid = index;

      let buttons = cleanTab.querySelectorAll('[data-button]');
      buttons.forEach( (button, buttonIndex) => {
        button.dataset.guid = buttonIndex;
      })

      let contents = cleanTab.querySelectorAll(['[data-content]']);
      contents.forEach( (content, contentIndex) => {
        content.dataset.guid = contentIndex;
      })
    });
  }

  getDataOptions(cleanTab) {
    if (!cleanTab.hasAttribute('data-options')) return;
    return JSON.parse(cleanTab.dataset.options);
  }
}






// TODO: Add aria support

/**
 * Entry point to the plugin.
 */
class CleanAccordion {
  constructor(cleanAccordionGroups = [], options = {}) {
    this.cleanAccordionGroups = cleanAccordionGroups;
    if (this.cleanAccordionGroups.length <= 0) return;

    const defaultOptions = {
      _name: "CleanAccordion",
      _version: "1.0.0",
      singleOpen: true,                 // Should only one accordion be open at a time?
      beforeOpen: (accordion) => {},
      afterOpen: (accordion) => {},
      beforeClose: (accordion) => {},
      afterClose: (accordion) => {}
    }

    this.options = { ...defaultOptions, ...options }
    this.handleResize = this.debounce(this.handleResize.bind(this), 100);
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {

    // cleanAccordionGroup click events
    this.cleanAccordionGroups.forEach( (cleanAccordion) => {
      cleanAccordion.addEventListener('click', (event) => { this.handleAccordionClick(event) });
    });

    // Resizing
    window.addEventListener('resize', () => { this.handleResize() })
  }

  handleAccordionClick(event) {
    let target = event.target;
    let accordion = target.parentNode

    // 1. Check if the title was clicked
    if (target.hasAttribute('data-control')) {

      // 2. Open/Close the accordion
      this.openClose(accordion);

    }
  }

  handleResize() {
    this.cleanAccordionGroups.forEach( (cleanAccordionGroup) => {
      const contents = cleanAccordionGroup.querySelectorAll('[data-content]');
      contents.forEach( content => {
        this.calculateContentHeight(content);
      });
    });
  }

  openClose(accordion) {
    if (accordion.classList.contains('open')) {
      this.close(accordion);
    } else {
      this.open(accordion);
    }
  }

  calculateContentHeight(content) {
    if (!content.parentNode.classList.contains('open')) return;
    content.style.maxHeight = `${content.scrollHeight}px`;
  }
  
  /**
   * Returns the computed height including margin of the passed element
   * @param {object} element 
   */
  getComputedHeight(element) {
    let height = element.scrollHeight
    let computedStyle = window.getComputedStyle(element);
    let marginTop = parseInt(computedStyle.marginTop.replace('px', ''));
    let marginBottom = parseInt(computedStyle.marginBottom.replace('px', ''));
    return height + marginTop + marginBottom;
  }

  resetContentHeight(content) {
    content.style.maxHeight = '';
  }

  /**
   * Open an accordion
   * @param {*} accordion The accordion to open 
   */
  open(accordion) {
    // 1. beforeOpen callback
    this.options.beforeOpen(accordion);

    // 2. Check option conditionals.
    this.closeAll(accordion);

    // 3. Open accordion
    let content = accordion.querySelector('[data-content]');
    accordion.classList.add('open');
    this.calculateContentHeight(content);
    
    // 4. afterOpen callback
    this.options.afterOpen(accordion);
  }

  /**
   * Close an accordion
   * @param {*} accordion The accordion to close
   */
  close(accordion) {

    // 1. beforeClose callback
    this.options.beforeClose(accordion);

    // 2. Close accordion
    let content = accordion.querySelector('[data-content]');
    accordion.classList.remove('open');
    this.resetContentHeight(content);

    // 3. afterClose callback
    this.options.afterClose(accordion);
  }

  /**
   * Closes each accordion.
   * @param {*} accordion The current accordion.
   */
  closeAll(accordion) {

    // 1. Check if data options were passed.
    let accordionGroup = accordion.parentNode;
    let dataOptions = this.getDataOptions(accordionGroup);

    if ('singleOpen' in dataOptions) {
      if (dataOptions.singleOpen === false) return;
    } else {
      if (!this.options.singleOpen) return;
    }

    // 2. Proceed closing accordions
    let accordions = accordionGroup.querySelectorAll('[data-accordion]');

    accordions.forEach( (accordion) => {
      this.close(accordion);
    });
  }

  getDataOptions(accordionGroup) {
    let dataOptions = {};
    if (accordionGroup.hasAttribute('data-options')) {
      dataOptions = JSON.parse(accordionGroup.dataset.options);
    }
    return dataOptions;
  }

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
}