import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() className = '';
}

@Component({
  selector: 'ui-card-header',
  standalone: false,
  templateUrl: './card-header.component.html',
  styleUrl: './card-header.component.scss',
})
export class CardHeaderComponent {
  @Input() className = '';
}

@Component({
  selector: 'ui-card-title',
  standalone: false,
  templateUrl: './card-title.component.html',
  styleUrl: './card-title.component.scss',
})
export class CardTitleComponent {
  @Input() className = '';
}

@Component({
  selector: 'ui-card-description',
  standalone: false,
  templateUrl: './card-description.component.html',
  styleUrl: './card-description.component.scss',
})
export class CardDescriptionComponent {
  @Input() className = '';
}

@Component({
  selector: 'ui-card-content',
  standalone: false,
  templateUrl: './card-content.component.html',
  styleUrl: './card-content.component.scss',
})
export class CardContentComponent {
  @Input() className = '';
}


