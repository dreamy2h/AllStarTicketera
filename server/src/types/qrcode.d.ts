declare module 'qrcode' {
  export interface QRCodeOptions {
    width?: number;
    margin?: number;
    scale?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
  }

  export function toBuffer(text: string | Buffer, options?: QRCodeOptions): Promise<Buffer>;
  export function toDataURL(text: string | Buffer, options?: QRCodeOptions): Promise<string>;
  export function toString(text: string | Buffer, options?: QRCodeOptions): Promise<string>;
  export function toFile(path: string, text: string | Buffer, options?: QRCodeOptions): Promise<void>;
  
  const qrcode: {
    toBuffer: typeof toBuffer;
    toDataURL: typeof toDataURL;
    toString: typeof toString;
    toFile: typeof toFile;
  };
  
  export default qrcode;
}
