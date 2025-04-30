import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setQuality(100);
Config.setFrameRate(30);
Config.setWidth(1920);
Config.setHeight(1080);
Config.setPixelFormat('yuv420p'); 