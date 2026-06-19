import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex items-center justify-center w-full h-full bg-gray-950 text-center p-8">
          <div className="max-w-md">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">WebGL không khả dụng</h2>
            <p className="text-gray-400 mb-4">
              Trình duyệt của bạn không hỗ trợ WebGL trong môi trường này.
              Hãy mở game trong tab/cửa sổ trình duyệt thực để trải nghiệm 3D đầy đủ.
            </p>
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold transition-all"
            >
              🚀 Mở trong tab mới
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
