declare global {
  interface Window {
    cordova: any;
    StatusBar: any;
    loadJsFile(fileName:string) : void;
    FB: any;
    fbAsyncInit() : void;
    inappbilling: any;
    initBranch() : void;
    FlurryAgent: any;
    myHandleBranch(err:any, data:any) : void;
    branch: any;
    myRequestAnimationFrame(callback:any): void;
    webkitRequestAnimationFrame(): void;
    mozRequestAnimationFrame(): void;
  }

  interface String {
    format(): string;
    replaceAll(search: string, replacement: string): string;
  }

  interface Date {
    clearTime(): void;
  }
}

export interface Settings {
  general: GeneralSettings;
}

export interface GeneralSettings {
  webCanvasWidth: number;
}

export interface User {
  clientInfo: ClientInfo;
}

export interface UserSettings {

}

export interface ClientInfo {
  appVersion: string;
}

export interface String {
  format() : string;
}
