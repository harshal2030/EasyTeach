package com.hcodes.easyteach.generated;

import java.util.Arrays;
import java.util.List;
import org.unimodules.core.interfaces.Package;

public class BasePackageList {
  public List<Package> getPackageList() {
    return Arrays.<Package>asList(
        new expo.modules.constants.ConstantsPackage(),
        new expo.modules.firebase.analytics.FirebaseAnalyticsPackage(),
        new expo.modules.firebase.core.FirebaseCorePackage()
    );
  }
}
