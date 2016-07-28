export {};

declare global
{
  interface Window {
    cordova: any;
    device: any;
    StatusBar: any;
    loadJsFile(fileName:string) : void;
    FB: IFB;
    fbAsyncInit() : void;
    inappbilling: any;
    initBranch() : void;
    FlurryAgent: any;
    myHandleBranch(err:any, data:any) : void;
    branch: any;
    myRequestAnimationFrame(callback:any): void;
    webkitRequestAnimationFrame(): void;
    mozRequestAnimationFrame(): void;
    FusionCharts: any;
    facebookConnectPlugin: any;
    PushNotification: any;
    myLogError(errorType:string, message:string): void;
    plugins: any;
  }

  interface Navigator {
    languages: Array<Object>;
  }

  interface String {
    format(): string;
    replaceAll(search:string, replacement:string): string;
  }

  interface Date {
    clearTime(): void;
  }
}

interface IFB {
  ui(data:Object, callback:any): void;
  init(data:Object): void;
  getLoginStatus(callback:any): void;
  login(callback:any, permissions:Object): void;
  logout(callback:any): void;
}
