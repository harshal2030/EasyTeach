package com.hcodes.easyteach;

import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import com.swmansion.reanimated.ReanimatedJSIModulePackage;

import java.util.Collections;
import java.util.List;
public class EasyJSI extends ReanimatedJSIModulePackage {
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
        super.getJSIModules(reactApplicationContext, jsContext); // <-- ADD THIS

        return Collections.emptyList();
    }
}
