package com.scripttodoc.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register plugins here if needed
        // this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
        //     add(CameraPlugin.class);
        //     add(FilesystemPlugin.class);
        //     add(SharePlugin.class);
        // }});
    }
}
