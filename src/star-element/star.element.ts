import styles from './star.element.scss';
import html from './star.element.html';

export class StarElement extends HTMLElement {
  private _maxStars = 5;
  private starTemplate!: HTMLTemplateElement;
  private _value = 0;

  public set maxStars(maxStarsRaw: number | string) {
    const maxStars = Number.parseInt(maxStarsRaw as string, 10);

    if (Number.isNaN(maxStars) || maxStars < 1) {
      console.warn('Передан невалидный параметр `maxStars` в компоненту `StarElement`');
      return;
    }

    this._maxStars = maxStars;

    if (maxStars < this._value) {
      this._value = maxStars;
    }

    if (!this.isConnected) {
      return;
    }

    this.render();
  }

  /** такое название переменной выбрано для симуляции <input> элемента */
  public set value(rawScore: unknown) {
    let score = Number.parseInt(rawScore as string, 10);

    if (!Number.isInteger(score) || score < 0) {
      console.warn('Передан невалидный параметр `value` в компоненту `StarElement`');
      return;
    }

    if (score > this._maxStars) {
      score = this._maxStars;
    }

    if (!this.isConnected) {
      return;
    }

    this.selectStars(score);
  }

  public get value() {
    return this._value;
  }

  /** создаем новое теневое DOM дерево, чтобы крепить к нему элементы компоненты */
  protected componentShadowRoot = this.attachShadow({ mode: 'closed' });

  constructor() {
    super();

    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;

    const template = document.createElement('template');
    template.innerHTML = html;

    // закидываем верстку в теневое DOM дерево
    this.componentShadowRoot.append(template.content.cloneNode(true), styleElement);
  }

  /** хук после подключения компоненты к корневому DOM, можно работать с элеменнтами */
  protected connectedCallback() {
    const starTemplate = this.componentShadowRoot.getElementById('star-template') as HTMLTemplateElement | null;

    if (!starTemplate) {
      throw new Error('Не найден шаблон `star-template` в разметке элемента StarElement');
    }

    this.starTemplate = starTemplate;
    this.render();
  }

  /** хук перед отключением компоненты от корневого DOM, убираем за собой */
  protected disconnectedCallback() {
    const oldStarsElements = this.componentShadowRoot.querySelectorAll<HTMLElement>('.star');
    oldStarsElements.forEach((starElement) => {
      starElement.removeEventListener('click', this.starClickListener);
    });
  }

  /** список атрибутов, которые мы хотим слушать */
  protected static get observedAttributes(): string[] {
    return ['data-max-stars'];
  }

  /** ловим изменения в прослушиваемых атрибутах */
  protected async attributeChangedCallback(name: string, oldValue: string, newValue: string): Promise<void> {
    switch (name) {
      case 'data-max-stars':
        this.maxStars = newValue;
        break;
    }
  }

  private render() {
    const oldStarsElements = this.componentShadowRoot.querySelectorAll<HTMLElement>('.star');
    oldStarsElements.forEach((starElement) => {
      starElement.removeEventListener('click', this.starClickListener);
      starElement.remove();
    });

    const newStarsElements = Array(this._maxStars)
      .fill(null)
      .map((_, i) => {
        const templateFragment = this.starTemplate.content;
        const starElementTemplate = templateFragment.querySelector('.star') as HTMLElement;
        const starElement = starElementTemplate.cloneNode(true) as HTMLElement;
        starElement.addEventListener('click', this.starClickListener);
        starElement.setAttribute('data-position', String(i + 1));

        if (this._value >= i + 1) {
          starElement.classList.add('select');
        }

        return starElement;
      });

    this.componentShadowRoot.append(...newStarsElements);
  }

  private starClickListener = (event: Event) => {
    const starElement = event.currentTarget as HTMLElement;
    this.value = starElement.getAttribute('data-position');
  };

  private selectStars(score: number) {
    const starsElements = this.componentShadowRoot.querySelectorAll<HTMLElement>('.star');
    starsElements.forEach((starElement, i) => {
      if (score >= i + 1) {
        starElement.classList.add('select');
      } else {
        starElement.classList.remove('select');
      }
    });

    /** эмуляция поведения <input>, удобно для работы Angular + Reactive Forms */
    this._value = score;
    this.dispatchEvent(new Event('input'));

    /** дублирующее событие для тех, не может отработать с компонентой как с <input> */
    const customEvent = new CustomEvent('scoreSelect', {
      detail: score,
      bubbles: false, // не будем мусорить в корневом DOM дереве
    });

    this.dispatchEvent(customEvent);
  }
}
