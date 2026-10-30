import React from 'react';
import { Modal } from '../Common/Modal';
import { Download, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  videoType: 'shorts' | 'long_form';
  youtubeUrl?: string;
}

export const VideoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  videoType,
  youtubeUrl,
}) => {
  const isShorts = videoType === 'shorts';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={isShorts ? 'max-w-md' : 'max-w-4xl'}>
      <div className="flex flex-col items-center">
        <div
          className={`w-full overflow-hidden rounded-xl bg-black shadow-inner flex items-center justify-center ${
            isShorts ? 'aspect-[9/16] max-h-[620px]' : 'aspect-video'
          }`}
        >
          <video
            src={videoUrl}
            controls
            autoPlay
            className="h-full w-full object-contain"
          />
        </div>

        <div className="mt-4 flex w-full items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Format: {isShorts ? 'Vertical Shorts (9:16)' : 'Widescreen (16:9)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={videoUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-lg bg-studio-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-studio-700 hover:text-white transition-colors"
            >
              <Download className="h-4 w-4" />
              Download MP4
            </a>
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/30"
              >
                <ExternalLink className="h-4 w-4" />
                View on YouTube
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

