
import { localDb } from './local-db';

// Mock types to satisfy Firestore imports
export const db: any = { type: 'local' };
export const auth: any = {
  currentUser: { uid: 'local-user' },
  onAuthStateChanged: (cb: any) => cb({ uid: 'local-user' })
};

export const collection = (db: any, name: string) => ({ 
  type: 'collection', 
  name,
  path: name 
});

export const doc = (arg1?: any, arg2?: any, arg3?: any) => {
  const args = [arg1, arg2, arg3].filter(a => a !== undefined);
  if (args.length === 3) {
    return { type: 'doc', name: args[1], id: args[2] };
  }
  if (args.length === 2) {
    if (args[0] && args[0].type === 'collection') {
      return { type: 'doc', name: args[0].name, id: args[1] };
    }
    if (typeof args[1] === 'string') {
      const parts = args[1].split('/');
      if (parts.length > 1) {
        return { type: 'doc', name: parts[0], id: parts[1] };
      }
      return { type: 'doc', name: args[0].name || args[0], id: args[1] };
    }
  }
  if (args.length === 1 && args[0] && args[0].type === 'collection') {
    return { type: 'doc', name: args[0].name, id: Math.random().toString(36).substring(2) };
  }
  return { type: 'doc' };
};

export const query = (ref: any, ...constraints: any[]) => {
  return { ...ref, constraints };
};

export const where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });
export const orderBy = (field: string, dir: string = 'asc') => ({ type: 'orderBy', field, dir });
export const limit = (val: number) => ({ type: 'limit', value: val });
export const increment = (val: number) => ({ type: 'increment', value: val });

export const serverTimestamp = () => ({
  _isTimestamp: true,
  _date: new Date(),
  toDate: function() { return this._date; },
  toMillis: function() { return this._date.getTime(); },
  toISOString: function() { return this._date.toISOString(); }
});

export const parseDateSafe = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return val;
  
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        return parseDateSafe(obj);
      } catch (e) {
        // Ignored
      }
    }
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      return new Date(num.toString().length <= 10 ? num * 1000 : num);
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      try {
        return val.toDate();
      } catch (e) {}
    }
    if (typeof val.seconds === 'number') {
      return new Date(val.seconds * 1000);
    }
    if (typeof val._seconds === 'number') {
      return new Date(val._seconds * 1000);
    }
    if (val._date) {
      return parseDateSafe(val._date);
    }
    if (val.toDate && typeof val.toDate === 'object') {
      // Sometimes it could be stringified
      return parseDateSafe(val.toDate);
    }
  }

  if (typeof val === 'number') {
    return new Date(val.toString().length <= 10 ? val * 1000 : val);
  }

  return null;
};

export const getDoc = async (docRef: any) => {
  const table = docRef.name;
  const id = docRef.id;
  
  if (table === 'settings') {
    const res = await localDb.query('SELECT * FROM settings WHERE id = ?', [id]);
    if (res.values && res.values.length > 0) {
      return { 
        exists: () => true, 
        id,
        data: () => JSON.parse(res.values[0].data) 
      };
    }
    return { id, exists: () => false, data: () => undefined };
  }

  const res = await localDb.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (res.values && res.values.length > 0) {
    const data = { ...res.values[0] };
    // Wrap dates
    ['createdAt', 'updatedAt', 'timestamp', 'actionDate', 'deliveredAt', 'output_datetime'].forEach(field => {
      if (data[field]) {
        const d = parseDateSafe(data[field]);
        if (d && !isNaN(d.getTime())) {
          data[field] = {
            toDate: () => d,
            toMillis: () => d.getTime(),
            toISOString: () => d.toISOString()
          };
        }
      }
    });
    return { 
      exists: () => true,
      id,
      data: () => data 
    };
  }
  return { id, exists: () => false, data: () => undefined };
};

export const getDocs = async (queryRef: any) => {
  const table = queryRef.name;
  let sql = `SELECT * FROM ${table}`;
  const params: any[] = [];

  const wheres = queryRef.constraints?.filter((c: any) => c.type === 'where') || [];
  if (wheres.length > 0) {
    sql += ' WHERE ' + wheres.map((w: any) => {
      params.push(w.value);
      const op = w.op === '==' ? '=' : w.op;
      return `${w.field} ${op} ?`;
    }).join(' AND ');
  }

  const orders = queryRef.constraints?.filter((c: any) => c.type === 'orderBy') || [];
  if (orders.length > 0) {
    sql += ' ORDER BY ' + orders.map((o: any) => `${o.field} ${o.dir}`).join(', ');
  }

  const lim = queryRef.constraints?.find((c: any) => c.type === 'limit');
  if (lim) {
    sql += ` LIMIT ${lim.value}`;
  }

  const res = await localDb.query(sql, params);
  const docs = (res.values || []).map(rawDoc => {
    const docData = { ...rawDoc };
    if (docData.updates && typeof docData.updates === 'string') {
       try { docData.updates = JSON.parse(docData.updates); } catch(e) {}
    }
    if (docData.permissions && typeof docData.permissions === 'string') {
       try { docData.permissions = JSON.parse(docData.permissions); } catch(e) {}
    }
    ['createdAt', 'updatedAt', 'timestamp', 'actionDate', 'deliveredAt', 'output_datetime'].forEach(field => {
      if (docData[field]) {
        const d = parseDateSafe(docData[field]);
        if (d && !isNaN(d.getTime())) {
          docData[field] = {
            toDate: () => d,
            toMillis: () => d.getTime(),
            toISOString: () => d.toISOString()
          };
        }
      }
    });
    return {
      id: docData.id,
      ref: { name: table, id: docData.id, path: `${table}/${docData.id}` },
      data: () => docData
    };
  });

  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (cb: any) => docs.forEach(cb)
  };
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
  const table = docRef.name;
  const id = docRef.id || data.id || Math.random().toString(36).substring(2);
  
  // Clean dates for storage
  const cleanedData = { ...data };
  Object.keys(cleanedData).forEach(field => {
    const val = cleanedData[field];
    if (val && typeof val === 'object' && typeof val.toISOString === 'function') {
      try {
        cleanedData[field] = val.toISOString();
      } catch (e) {
        // Ignored, bad date
      }
    }
  });

  if (table === 'settings') {
    const existing = await localDb.query('SELECT * FROM settings WHERE id = ?', [id]);
    if (existing.values && existing.values.length > 0) {
      const merged = options?.merge ? { ...JSON.parse(existing.values[0].data), ...cleanedData } : cleanedData;
      await localDb.run('UPDATE settings SET data = ? WHERE id = ?', [JSON.stringify(merged), id]);
    } else {
      await localDb.run('INSERT INTO settings (id, data) VALUES (?, ?)', [id, JSON.stringify(cleanedData)]);
    }
  } else {
    console.log(`Setting doc in table ${table} with id ${id}`);
    const existing = await localDb.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    
    // Clean dates for storage AND stringify objects
    const finalData = (options?.merge && existing.values && existing.values.length > 0) 
    ? { ...existing.values[0], ...cleanedData } 
    : cleanedData;

    Object.keys(finalData).forEach(key => {
      if (finalData[key] && typeof finalData[key] === 'object' && !finalData[key].toISOString) {
        finalData[key] = JSON.stringify(finalData[key]);
      }
    });

    const fields = Object.keys(finalData);
    const placeholders = fields.map(() => '?').join(', ');
    const updatePlaceholders = fields.map(f => `${f} = ?`).join(', ');

    console.log(`Fields: ${fields.join(', ')}`);
    if (existing.values && existing.values.length > 0) {
      console.log(`Updating ${table} with id ${id}`);
      await localDb.run(`UPDATE ${table} SET ${updatePlaceholders} WHERE id = ?`, [...Object.values(finalData), id]);
    } else {
      console.log(`Inserting into ${table} with id ${id}`);
      await localDb.run(`INSERT INTO ${table} (id, ${fields.join(', ')}) VALUES (?, ${placeholders})`, [id, ...Object.values(finalData)]);
    }
  }

  // Trigger notification
  const res = await localDb.query(`SELECT * FROM ${table}`);
  localDb.notify(table, res.values || []);
};

export const addDoc = async (colRef: any, data: any, more?: any) => {
  const id = Math.random().toString(36).substring(2);
  await setDoc({ name: colRef.name, id }, data);
  return { id };
};

export const updateDoc = async (docRef: any, data: any, more?: any) => {
  const table = docRef.name;
  const id = docRef.id;
  
  const cleanedData = { ...data };
  const increments: { key: string, value: number }[] = [];

  Object.keys(cleanedData).forEach(key => {
    const val = cleanedData[key];
    if (val && typeof val === 'object') {
      if (val.type === 'increment') {
        increments.push({ key, value: val.value });
        delete cleanedData[key];
        return;
      }
      if (!val.toISOString) {
        cleanedData[key] = JSON.stringify(val);
      } else {
        try {
          cleanedData[key] = val.toISOString();
        } catch (e) {}
      }
    }
  });

  const fields = Object.keys(cleanedData);
  const updateParts = fields.map(f => `${f} = ?`);
  increments.forEach(inc => {
    updateParts.push(`${inc.key} = COALESCE(${inc.key}, 0) + ${inc.value}`);
  });

  if (updateParts.length === 0) return;

  const sql = `UPDATE ${table} SET ${updateParts.join(', ')} WHERE id = ?`;
  await localDb.run(sql, [...Object.values(cleanedData), id]);
  
  // Trigger notification
  const res = await localDb.query(`SELECT * FROM ${table}`);
  localDb.notify(table, res.values || []);
};

export const deleteDoc = async (docRef: any) => {
  const table = docRef.name;
  await localDb.run(`DELETE FROM ${table} WHERE id = ?`, [docRef.id]);
  
  // Trigger notification
  const res = await localDb.query(`SELECT * FROM ${table}`);
  localDb.notify(table, res.values || []);
};

export const onSnapshot = (queryRef: any, callback: any, errorCallback?: any) => {
  const table = queryRef.name;
  const isDoc = queryRef.type === 'doc';
  const docId = queryRef.id;
  
  const unsubscribe = localDb.subscribe(table, (data) => {
    try {
      if (isDoc) {
        const rawDoc = data.find((d: any) => d.id === docId);
        if (rawDoc) {
          const docData = { ...rawDoc };
          if (table === 'settings' && docData.data) {
             try { 
               const parsed = JSON.parse(docData.data);
               Object.assign(docData, parsed);
             } catch(e) {}
          }
          if (docData.permissions && typeof docData.permissions === 'string') {
             try { docData.permissions = JSON.parse(docData.permissions); } catch(e) {}
          }
          ['createdAt', 'updatedAt', 'timestamp', 'actionDate', 'deliveredAt', 'output_datetime'].forEach(field => {
            if (docData[field]) {
              const d = parseDateSafe(docData[field]);
              if (d && !isNaN(d.getTime())) {
                docData[field] = {
                  toDate: () => d,
                  toMillis: () => d.getTime(),
                  toISOString: () => d.toISOString()
                };
              }
            }
          });
          callback({
            exists: () => true,
            id: docId,
            data: () => docData
          });
        } else {
          callback({
            exists: () => false,
            id: docId,
            data: () => undefined
          });
        }
        return;
      }

      // Basic filtering if query has constraints
      let filtered = [...data];
      const wheres = queryRef.constraints?.filter((c: any) => c.type === 'where') || [];
      wheres.forEach((w: any) => {
        filtered = filtered.filter(item => {
          if (w.op === '==' || w.op === '=') return item[w.field] === w.value;
          if (w.op === '>') return item[w.field] > w.value;
          if (w.op === '<') return item[w.field] < w.value;
          if (w.op === '>=') return item[w.field] >= w.value;
          if (w.op === '<=') return item[w.field] <= w.value;
          return true;
        });
      });

      const orders = queryRef.constraints?.filter((c: any) => c.type === 'orderBy') || [];
      orders.forEach((o: any) => {
        filtered.sort((a, b) => {
          if (o.dir === 'desc') return b[o.field] > a[o.field] ? 1 : -1;
          return a[o.field] > b[o.field] ? 1 : -1;
        });
      });

      const docs = filtered.map(doc => {
        const docData = { ...doc };
        if (docData.updates && typeof docData.updates === 'string') {
          try { docData.updates = JSON.parse(docData.updates); } catch(e) {}
        }
        if (docData.permissions && typeof docData.permissions === 'string') {
          try { docData.permissions = JSON.parse(docData.permissions); } catch(e) {}
        }
        ['createdAt', 'updatedAt', 'timestamp', 'actionDate', 'deliveredAt', 'output_datetime'].forEach(field => {
          if (docData[field]) {
            const d = parseDateSafe(docData[field]);
            if (d && !isNaN(d.getTime())) {
              docData[field] = {
                toDate: () => d,
                toMillis: () => d.getTime(),
                toISOString: () => d.toISOString()
              };
            }
          }
        });
        return {
          id: docData.id,
          ref: { name: table, id: docData.id, path: `${table}/${docData.id}` },
          data: () => docData
        };
      });

      callback({
        docs,
        empty: filtered.length === 0,
        size: filtered.length,
        forEach: (cb: any) => docs.forEach(cb)
      });
    } catch (err) {
      if (errorCallback) errorCallback(err);
    }
  });

  return unsubscribe;
};

export const runTransaction = async (db: any, updateFunction: any) => {
  const transaction = {
    get: async (docRef: any) => getDoc(docRef),
    set: async (docRef: any, data: any) => setDoc(docRef, data),
    update: async (docRef: any, data: any) => updateDoc(docRef, data),
    delete: async (docRef: any) => deleteDoc(docRef)
  };
  return await updateFunction(transaction);
};

export const writeBatch = (db: any) => {
  const operations: any[] = [];
  return {
    set: (docRef: any, data: any, options?: any) => operations.push({ type: 'set', ref: docRef, data, options }),
    update: (docRef: any, data: any, options?: any) => operations.push({ type: 'update', ref: docRef, data, options }),
    delete: (docRef: any) => operations.push({ type: 'delete', ref: docRef }),
    commit: async () => {
      for (const op of operations) {
        if (op.type === 'set') await setDoc(op.ref, op.data, op.options);
        if (op.type === 'update') await updateDoc(op.ref, op.data, op.options);
        if (op.type === 'delete') await deleteDoc(op.ref);
      }
    }
  };
};
