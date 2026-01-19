
export interface TopicMap {
  [key: string]: string;
}

export interface PersonaMap {
  [key: string]: string;
}

export interface GenerationParams {
  topic: string;
  topicDescription?: string;
  vocalist: string;
  vocalistDetail: string;
  producer?: string;
  producerDetail?: string;
  customStyle?: string;
  rhymeScheme?: string;
  rhymeSchemeDetail?: string;
}
