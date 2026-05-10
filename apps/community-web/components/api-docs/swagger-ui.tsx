"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function CommunityApiSwagger() {
  return (
    <SwaggerUI
      url="/api/openapi"
      docExpansion="list"
      defaultModelExpandDepth={2}
      tryItOutEnabled
      persistAuthorization
      requestInterceptor={(req) => {
        const next = { ...req, credentials: "include" as RequestCredentials };
        return next;
      }}
    />
  );
}
