import 'katex/dist/katex.min.css';
import '#/assets/common.css';
import '#/assets/fonts.css';

import { createRouter as createVueRouter, createWebHistory } from 'vue-router';

import type { Router, RouteRecordRaw } from 'vue-router';
import type { Component } from 'vue';

export function setTheme(color1: string, color2: string, color3: string) {
    document.documentElement.style.setProperty('--color-1', color1);
    document.documentElement.style.setProperty('--color-2', color2);
    document.documentElement.style.setProperty('--color-3', color3);
}

export function createRouter(App: Component, routes: RouteRecordRaw[]): Router {
    const router = createVueRouter({
        history: createWebHistory(),
        routes: [
            { path: '/', redirect: '/home' },
            // not the right way to do this (but oh well)
            {
                path: '/:page',
                components: { App },
                children: [{
                    path: ':panel',
                    components: { App }
                }]
            },
            {
                path: '/:page(contest)',
                components: { App },
                children: [
                    {
                        path: ':panel',
                        components: { App }
                    },
                    {
                        path: ':panel(problemView)/:problemId',
                        components: { App }
                    },
                    {
                        path: ':panel(problemView)/:problemRound(\\d+)_:problemNumber(\\d+)',
                        components: { App }
                    },
                ]
            },
            {
                path: '/:page(upsolve)',
                components: { App },
                children: [
                    {
                        path: ':panel',
                        components: { App }
                    },
                    {
                        path: ':panel(view)/:archiveContest',
                        components: { App },
                        children: [{
                            path: ':archiveRound',
                            components: { App },
                            children: [{
                                path: ':archiveProblem',
                                components: { App }
                            }]
                        }]
                    }
                ]
            },
            ...routes,
            {
                path: '/:page(user)/@:userView',
                components: { App }
            },
            // spaghetti
            {
                path: '/:catchAll+',
                components: { App }
            }
        ]
    });
    let handledRoute = false;
    router.beforeEach((to, from, next) => {
        // keep old queries unless cleared
        if (to.query.clearQuery !== undefined) {
            next({ ...to, query: { ...to.query, clearQuery: undefined, ignore_server: (from.query.ignore_server !== undefined || to.query.ignore_server !== undefined) ? null : undefined } });
        } else if (handledRoute) {
            next();
        } else {
            next({ ...to, query: { ...to.query, ...from.query, clearQuery: undefined } });
        }
        handledRoute = true;
    });
    router.afterEach(() => {
        handledRoute = false;
    });
    return router;
}

export const isDev = process.env.NODE_ENV == 'development';