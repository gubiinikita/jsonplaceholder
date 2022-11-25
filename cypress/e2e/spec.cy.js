///<reference types = "cypress"/>
import postsContent from "../support/posts_content.json"

let token
let postId

describe('empty spec', () => {
  it.skip(`Registration`, () => {
    cy.request('POST', 'http://localhost:3000/register', { "email": "olivier123@mail.com", "password": "bestPassw0rd" }).then(response => {
      expect(response.status).to.be.eq(201);
    })
  })

  it(`Authorization`, () => {
    cy.request('POST', 'http://localhost:3000/login', { "email": "olivier123@mail.com", "password": "bestPassw0rd" }).then(response => {
      token = 'Bearer ' + response.body.accessToken
      expect(response.status).to.be.eq(200);
    })
  })

  it(`Get all posts`, () => {
    cy.request('GET', 'http://localhost:3000/posts').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.headers).to.have.property('content-type', 'application/json; charset=utf-8')
    })
  })

  it(`Get first 10 posts`, () => {
    cy.request('GET', 'http://localhost:3000/posts?_start=0&_end=10').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.body).to.deep.equal(postsContent)
    })
  })

  it(`Get posts with ID's 55 and 60`, () => {
    cy.request('GET', 'http://localhost:3000/posts?id=60&id=55').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.body[0].id).to.be.eq(55);
      expect(response.body[1].id).to.be.eq(60);
    })
  })

  it(`Create new post without auth but with auth route`, () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/664/posts',
      body:
      {
        title: "111",
        body: "1111"
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(401);
    })
  })

  it(`Create new post with auth`, () => {
    cy.request({
      headers:
      {
        'Authorization': token
      },
      method: 'POST',
      url: 'http://localhost:3000/664/posts',
      body:
      {
        title: "111",
        body: "1111"
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq('111');
      expect(response.body.body).to.be.eq('1111');
    })
  })

  it(`Create new post without auth`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: 'http://localhost:3000/posts',
      body:
      {
        title: "111",
        body: "1111"
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq('111');
      expect(response.body.body).to.be.eq('1111');
    })
  })

  it(`Update non-existing post`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'PATCH',
      url: 'http://localhost:3000/posts/128323',
      body:
      {
        title: "111",
        body: "1111"
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(404);
    })
  })

  it(`Create new post and update it`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: 'http://localhost:3000/posts',
      body:
      {
        title: "111",
        body: "1111"
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq('111');
      expect(response.body.body).to.be.eq('1111');
      postId = response.body.id
    }).then(() => {
      cy.request({
        headers:
        {
          'Content-Type': 'application/json'
        },
        method: 'PATCH',
        url: `http://localhost:3000/posts/${postId}`,
        body:
        {
          title: "updated post",
          body: "updated post"
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq('updated post');
        expect(response.body.body).to.be.eq('updated post');
      }).then(() => {
        cy.request({
          headers:
          {
            'Content-Type': 'application/json'
          },
          method: 'GET',
          url: `http://localhost:3000/posts/${postId}`
        }).then(response => {
          expect(response.status).to.be.eq(200);
          expect(response.body.title).to.be.eq('updated post');
          expect(response.body.body).to.be.eq('updated post');
        })
      })
    })
  })

  it(`Delete non-existing post`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'PATCH',
      url: 'http://localhost:3000/posts/128323',
      body:
      {
        title: "111",
        body: "1111"
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(404);
    })
  })

  it(`Create new post and update it and then delete it`, () => {
    cy.request({
      headers:
      {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: 'http://localhost:3000/posts',
      body:
      {
        title: "111",
        body: "1111"
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq('111');
      expect(response.body.body).to.be.eq('1111');
      postId = response.body.id
    }).then(() => {
      cy.request({
        headers:
        {
          'Content-Type': 'application/json'
        },
        method: 'PATCH',
        url: `http://localhost:3000/posts/${postId}`,
        body:
        {
          title: "updated post",
          body: "updated post"
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq('updated post');
        expect(response.body.body).to.be.eq('updated post');
      }).then(() => {
        cy.request({
          headers:
          {
            'Content-Type': 'application/json'
          },
          method: 'DELETE',
          url: `http://localhost:3000/posts/${postId}`
        }).then(response => {
          expect(response.status).to.be.eq(200);
        }).then(() => {
          cy.request({
            headers:
            {
              'Content-Type': 'application/json'
            },
            method: 'GET',
            url: `http://localhost:3000/posts/${postId}`,
            failOnStatusCode: false
          }).then(response => {
            expect(response.status).to.be.eq(404);
          })
        })
      })
    })
  })
})