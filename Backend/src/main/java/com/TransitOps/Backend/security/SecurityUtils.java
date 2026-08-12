package com.TransitOps.Backend.security;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class SecurityUtils {
    public static Long getCompanyId() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr == null) return null;
        return (Long) attr.getRequest().getAttribute("companyId");
    }
}
