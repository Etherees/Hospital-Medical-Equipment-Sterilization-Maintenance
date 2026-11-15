package com.sterilflow.camunda;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface JobWorker {
    String type() default "";
    String name() default "";
    long timeout() default -1L;
    int maxJobsActive() default -1;
    long requestTimeout() default -1L;
    long pollInterval() default -1L;
    boolean autoComplete() default true;
    String[] fetchVariables() default {};
    boolean enabled() default true;
}