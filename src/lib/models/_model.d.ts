import { type ClassConstructor } from 'class-transformer';

export declare function from_json<Class, Data>(
    klass: ClassConstructor<Class>,
    data: Data[]
): Class[];
export declare function from_json<Class, Data>(klass: ClassConstructor<Class>, data: Data): Class;
