import { MediaPlayer, MediaProvider, SeekButton } from '@vidstack/react';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import { SeekBackward10Icon, SeekForward10Icon } from "@vidstack/react/icons";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function CopyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

export default async function Home({params}:{params: {slug: string}}) {
  console.log(params.slug);
  const data = await (await fetch(`http://localhost:8000/api/v1/video/details/${params.slug}`,{
    next:{
      tags: ["VIDEO_DATA"]
    }
  })).json()
  console.log(data);

  return (
    <>
    {data.transcode_state==="FINISHED"?(

      <Card className="w-full max-w-2xl mx-auto min-h-[calc(100vh-55px)] bg-gray-200">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <MediaPlayer
            title={data.title}
            src={`http://localhost:8000/cdn/${params.slug}/master.m3u8`}
            viewType='video'
            streamType='on-demand'
            logLevel='warn'
            crossOrigin
            playsInline
          >
            <MediaProvider>
              <SeekButton seconds={-10}>
                <SeekBackward10Icon />
              </SeekButton>

              <SeekButton seconds={10}>
                <SeekForward10Icon />
              </SeekButton>
            </MediaProvider>
            <DefaultAudioLayout icons={defaultLayoutIcons} />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">{data.title}</h3>
            <p className="text-muted-foreground">
              {data.description}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-medium">Embed Code</h4>
            <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
              <code className="font-mono text-sm flex-1 select-all">
                &lt;iframe width="560" height="315" src="http://localhost:8000/stream/embed?id={params.slug}{data.protected?"&token=ACCESSTOKEN":""}" frameborder="0"
                allow="accelerometer; autoplay; encrypted-media;\n gyroscope; picture-in-picture"
                allowfullscreen&gt;&lt;/iframe&gt;
              </code>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted">
                <CopyIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-medium">HLS Stream</h4>
            <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
              <code className="font-mono text-sm flex-1 select-all">http://localhost:8000/cdn/{params.slug}/master.m3u8</code>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted">
                <CopyIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ):(<p className='text-center text-4xl font-semibold'>Video Is not processed yet</p>)}
    </>
  );
}
