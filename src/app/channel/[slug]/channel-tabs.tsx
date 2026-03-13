'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RenderedHtml } from '@/components/content/rendered-html';
import { MetadataRow } from '@/components/content/metadata-row';
import { EmptyState } from '@/components/content/empty-state';
import type { ChannelDetail } from '@/types';

interface ChannelTabsProps {
  channel: ChannelDetail;
}

export function ChannelTabs({ channel }: ChannelTabsProps) {
  return (
    <Tabs defaultValue="latest" className="w-full">
      <TabsList>
        <TabsTrigger value="latest">Latest</TabsTrigger>
        <TabsTrigger value="rolling">Rolling</TabsTrigger>
        {channel.type === 'narrative' && (
          <TabsTrigger value="narrative">Narrative</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="latest">
        {channel.latest ? (
          <div>
            <MetadataRow
              generatedDate={channel.latest.generatedDate}
              model={channel.latest.model}
              sourceDate={channel.latest.sourceDate}
            />
            <div className="mt-4">
              <RenderedHtml html={channel.latest.html} />
            </div>
          </div>
        ) : (
          <EmptyState message="Not yet generated" />
        )}
      </TabsContent>

      <TabsContent value="rolling">
        {channel.rolling ? (
          <div>
            <MetadataRow
              generatedDate={channel.rolling.generatedDate}
              model={channel.rolling.model}
              videoCount={channel.rolling.videoCount}
            />
            <div className="mt-4">
              <RenderedHtml html={channel.rolling.html} />
            </div>
          </div>
        ) : (
          <EmptyState message="Not yet generated" />
        )}
      </TabsContent>

      {channel.type === 'narrative' && (
        <TabsContent value="narrative">
          {channel.narrative ? (
            <div>
              <MetadataRow
                generatedDate={channel.narrative.generatedDate}
                model={channel.narrative.model}
              />
              <div className="mt-4">
                <RenderedHtml html={channel.narrative.html} />
              </div>
            </div>
          ) : (
            <EmptyState message="Not yet generated" />
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}
