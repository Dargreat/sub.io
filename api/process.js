import { processVideo } from '../server/utils/videoProcessor';

export default async (req, res) => {
  try {
    const result = await processVideo(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
