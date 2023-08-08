package com.hcodes.easyteach; // <-- CHANGE TO YOUR PACKAGE NAME

import com.facebook.react.bridge.JSIModulePackage;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import java.util.Collections;
import java.util.List;

import com.swmansion.reanimated.ReanimatedJSIModulePackage; // <-- ADD THIS

public class MMKVJSIModulePackage extends ReanimatedJSIModulePackage { // Replace implements JSIModulePackage with extends ReanimatedJSIModulePackage 
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
        return super.getJSIModules(reactApplicationContext, jsContext);
    }
}
