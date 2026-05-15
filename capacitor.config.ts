import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.webify.smartpark",
  appName: "SmartPark",
  webDir: "out",
  server: {
    url: "https://outsidetecangra-cmd.github.io/parkflow-pro-web/",
    cleartext: false
  }
};

export default config;
