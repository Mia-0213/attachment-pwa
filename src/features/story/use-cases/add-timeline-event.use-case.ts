import { TimelineEvent } from "@/features/story/types/timeline.type";
import { TimelineRepository } from "@/core/repository/timeline.repository";

export class AddTimelineEventUseCase {
  private timelineRepo = new TimelineRepository();

  public async execute(storyId: string, eventText: string): Promise<TimelineEvent> {
    const eventObj: TimelineEvent = {
      id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      storyId,
      event: eventText.trim(),
      createdAt: Date.now(),
    };

    await this.timelineRepo.save(eventObj);
    return eventObj;
  }
}
