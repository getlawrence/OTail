package organization

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/mottibec/otail-server/pkg/telemetry"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type mongoOrgStore struct {
	client      *mongo.Client
	db          *mongo.Database
	collection  *mongo.Collection
	invitesColl *mongo.Collection
	membersColl *mongo.Collection
	apiTokens   *mongo.Collection
}

func NewMongoOrgStore(uri string, dbName string) (OrgStore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Client()
	opts.Monitor = telemetry.NewMonitor()
	opts.ApplyURI(uri)

	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, err
	}

	db := client.Database(dbName)
	store := &mongoOrgStore{
		client:      client,
		db:          db,
		collection:  db.Collection("organizations"),
		invitesColl: db.Collection("organization_invites"),
		membersColl: db.Collection("organization_members"),
		apiTokens:   db.Collection("api_tokens"),
	}

	// Create indexes
	if err := store.createIndexes(ctx); err != nil {
		return nil, err
	}

	return store, nil
}

func (s *mongoOrgStore) createIndexes(ctx context.Context) error {
	// Organization indexes
	orgIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "name", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	}

	// Invite indexes
	inviteIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "token", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{
				bson.E{Key: "organization_id", Value: 1},
				bson.E{Key: "expires_at", Value: 1},
				bson.E{Key: "used", Value: 1},
			},
		},
	}

	// Member indexes
	memberIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				bson.E{Key: "organization_id", Value: 1},
				bson.E{Key: "user_id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{bson.E{Key: "user_id", Value: 1}},
		},
	}

	// API Token indexes
	apiTokenIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				bson.E{Key: "organization_id", Value: 1},
				bson.E{Key: "token", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	}

	// Create indexes for each collection
	if _, err := s.collection.Indexes().CreateMany(ctx, orgIndexes); err != nil {
		return fmt.Errorf("failed to create organization indexes: %v", err)
	}

	if _, err := s.invitesColl.Indexes().CreateMany(ctx, inviteIndexes); err != nil {
		return fmt.Errorf("failed to create invite indexes: %v", err)
	}

	if _, err := s.membersColl.Indexes().CreateMany(ctx, memberIndexes); err != nil {
		return fmt.Errorf("failed to create member indexes: %v", err)
	}

	if _, err := s.apiTokens.Indexes().CreateMany(ctx, apiTokenIndexes); err != nil {
		return fmt.Errorf("failed to create api token indexes: %v", err)
	}

	return nil
}

func (s *mongoOrgStore) SaveInvite(ctx context.Context, invite *OrganizationInvite) error {
	_, err := s.invitesColl.InsertOne(ctx, invite)
	return err
}

func (s *mongoOrgStore) GetInvite(ctx context.Context, token string) (*OrganizationInvite, error) {
	var invite OrganizationInvite
	err := s.invitesColl.FindOne(ctx, bson.M{"token": token}).Decode(&invite)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &invite, nil
}

func (s *mongoOrgStore) MarkInviteAsUsed(ctx context.Context, token string) error {
	result, err := s.invitesColl.UpdateOne(
		ctx,
		bson.M{"token": token},
		bson.M{"$set": bson.M{"used": true}},
	)
	if err != nil {
		return err
	}
	if result.ModifiedCount == 0 {
		return fmt.Errorf("invite not found")
	}
	return nil
}

func (s *mongoOrgStore) AddUserToOrganization(ctx context.Context, organizationId string, userId string, email string, role UserRole) error {
	member := OrganizationMember{
		OrganizationID: organizationId,
		UserID:         userId,
		Email:          email,
		JoinedAt:       time.Now(),
		Role:           role,
	}
	_, err := s.membersColl.InsertOne(ctx, member)
	return err
}

func (s *mongoOrgStore) CreateOrganization(ctx context.Context, name string) (string, error) {
	id := uuid.New().String()
	org := Organization{
		ID:        id,
		Name:      name,
		CreatedAt: time.Now(),
	}
	_, err := s.collection.InsertOne(ctx, org)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (s *mongoOrgStore) OrganizationExists(ctx context.Context, name string) bool {
	count, err := s.collection.CountDocuments(ctx, bson.M{"name": name})
	if err != nil {
		return false
	}
	return count > 0
}

func (s *mongoOrgStore) GetOrganization(ctx context.Context, id string) (*Organization, error) {
	var org Organization
	err := s.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&org)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &org, nil
}

func (s *mongoOrgStore) GetOrganizationMembers(ctx context.Context, id string) ([]OrganizationMember, error) {
	cursor, err := s.membersColl.Find(ctx, bson.M{"organization_id": id})
	if err != nil {
		return nil, fmt.Errorf("failed to get organization members: %w", err)
	}
	defer cursor.Close(ctx)

	var members []OrganizationMember
	if err := cursor.All(ctx, &members); err != nil {
		return nil, fmt.Errorf("failed to decode organization members: %w", err)
	}
	return members, nil
}

func (s *mongoOrgStore) GetOrganizationInvites(ctx context.Context, id string) ([]OrganizationInvite, error) {
	cursor, err := s.invitesColl.Find(ctx, bson.M{
		"organization_id": id,
		"used":            false,
		"expires_at":      bson.M{"$gt": time.Now()},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get organization invites: %w", err)
	}
	defer cursor.Close(ctx)

	var invites []OrganizationInvite
	if err := cursor.All(ctx, &invites); err != nil {
		return nil, fmt.Errorf("failed to decode organization invites: %w", err)
	}
	return invites, nil
}

func (s *mongoOrgStore) CreateAPIToken(ctx context.Context, token *APIToken) error {
	_, err := s.apiTokens.InsertOne(ctx, token)
	return err
}

func (s *mongoOrgStore) GetAPITokenByToken(ctx context.Context, token string) (*APIToken, error) {
	var apiToken APIToken
	err := s.apiTokens.FindOne(ctx, bson.M{"token": token}).Decode(&apiToken)
	if err != nil {
		return nil, err
	}
	return &apiToken, nil
}

func (s *mongoOrgStore) GetAPITokens(ctx context.Context, orgId string) ([]APIToken, error) {
	cursor, err := s.apiTokens.Find(ctx, bson.M{"organization_id": orgId})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tokens []APIToken
	if err = cursor.All(ctx, &tokens); err != nil {
		return nil, err
	}
	return tokens, nil
}

func (s *mongoOrgStore) DeleteAPIToken(ctx context.Context, orgId string, tokenId string) error {
	_, err := s.apiTokens.DeleteOne(ctx, bson.M{
		"_id":             tokenId,
		"organization_id": orgId,
	})
	return err
}

func (s *mongoOrgStore) Close(ctx context.Context) error {
	return s.client.Disconnect(ctx)
}
