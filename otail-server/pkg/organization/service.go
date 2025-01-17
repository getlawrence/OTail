package organization

import (
	"errors"
	"strings"
)

type OrgService struct {
	store MongoOrgStore
}

func NewOrgService(orgStore MongoOrgStore) OrgService {
	return OrgService{
		store: orgStore,
	}
}

func (o *OrgService) CreateOrganization(name string, userId string) (string, error) {
	if o.store.OrganizationExists(name) {
		return "", errors.New("orgaziation exists")

	} else {
		return o.store.CreateOrganization(name)
	}
}

func (o *OrgService) JoinOrganization(name string, userId string, invite string) (bool, error) {
	if !o.verifyInvite(invite) {
		return false, errors.New("cannot verify invite")
	}
	_, err := o.store.JoinOrganization(name, userId)
	return err == nil, err
}

func (o *OrgService) verifyInvite(invite string) bool {
	return len(strings.Split("super-random-string", invite)) > 1
}
