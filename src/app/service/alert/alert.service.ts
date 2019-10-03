import { Injectable } from '@angular/core';
import { Subject, from } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';

/// An alert identifier, used to route external logic
export type AlertId = string | number;
/// An event that originated from an Alert
export class AlertEvent<TData> {
  alertId: AlertId;
  data: TData;
  constructor(alertId: AlertId, data: TData) {
    this.alertId = alertId;
    this.data = data;
  }
}
export class AlertClosedEvent extends AlertEvent<string> {
  alertId: AlertId;
  data: string;
  get button(): string {
    return this.data;
  }
}

export class AlertPresentedEvent extends AlertEvent<any> {
  alertId: AlertId;
  data: any;
}

export class AlertServiceEventBinder {
  private alertId: AlertId;
  private alert: HTMLIonAlertElement;
  public presented$: Subject<AlertPresentedEvent>;
  public closed$: Subject<AlertClosedEvent>;

  constructor(alertId: AlertId, alert: HTMLIonAlertElement) {
    this.alert = alert;
    this.closed$ = new Subject<AlertClosedEvent>();
    this.presented$ = new Subject<AlertPresentedEvent>();
    this.alertId = alertId;

    from(this.alert.onDidDismiss())
      .subscribe((detail: OverlayEventDetail) => {
        this.closed$.next(new AlertClosedEvent(alertId, detail.data));
      });
  }
  closed(callback: (evt: AlertClosedEvent) => void): AlertServiceEventBinder {
    this.closed$.subscribe((data: AlertClosedEvent) => callback(data));
    return this;
  }
  presented(callback: (evt: AlertPresentedEvent) => void): AlertServiceEventBinder {
    this.presented$.subscribe((data: AlertPresentedEvent) => callback(data));
    return this;
  }
  async present(): Promise<void> {
    await this.alert.present();
    this.presented$.next(new AlertPresentedEvent(this.alertId, null));
  }
}


@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private alertController: AlertController) {}

  async create(id: AlertId, header: string, message: string, buttons: string[]): Promise<AlertServiceEventBinder> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons
    });
    return new AlertServiceEventBinder(id, alert);
  }
}
