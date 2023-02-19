export const goPiscine = "/johvi/piscine-go/";
export const jsPiscine = "/johvi/div-01/piscine-js-2/";
export const divGeneral = "/johvi/div-01/";


export const transactionRequest = `
query ($offset: Int, $path: String, $userId: Int) {
  transaction(
    where: {
      userId: { _eq: $userId }
      type: { _eq: "xp" }
      path: { _iregex: $path }
    }
    offset: $offset
  ) {
    object {
      type
      name
    }
    path
    amount
    createdAt
  }
}
`;

export const OnlyDivPart = `
  query ($userId: Int){ progress 
    (where: { 
      userId: { _eq: $userId }
      _and: [
        {grade: {_neq: NaN}},
        {grade: {_neq: 0}}
      ]
      _or: [
      {object: {type: {_eq: "project"}}},
      {object: {type: {_eq: "piscine"}}}
      ]
    })
    {
      id
      objectId
      createdAt
      object {
        type
        name
      }
    }
  }`;

export const pointsRequestByObjectID = `
query($objectId: Int, $userId: Int){ 
  transaction(
      where: {
        userId: { _eq: $userId }
				objectId: {_eq: $objectId}
      }
    ) {
	    type
      amount
      object {
        name
      }
    }
  }
`;

export const auditPointsRequest = `
query ($offset: Int, $userId: Int) {
  transaction(
    where: {user: {id: {_eq: $userId}}, type: {_in: ["down", "up"]} }
    offset: $offset
  ) {
    type
    amount
  }
}
  `;

export const userRequest = `
query ($login: String) {
  user(where: {login: {_eq: $login}}) {
    id
    login
  }
}
`;