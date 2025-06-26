import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setConcurrency(1); // Reduce CPU usage during preview
Config.setChromiumDisableWebSecurity(true); // Allow CORS for R2 videos 