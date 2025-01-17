package organization

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type OrgHandler struct {
	orgSvc OrgService
	logger *zap.Logger
}

func NewOrgHandler(orgSvc OrgService, logger *zap.Logger) *OrgHandler {
	return &OrgHandler{
		orgSvc: orgSvc,
		logger: logger,
	}
}

func (h *OrgHandler) RegisterRoutes(r chi.Router) {
	r.Get("/", h.handleInvite)
}

func (h *OrgHandler) handleInvite(w http.ResponseWriter, r *http.Request) {

}
